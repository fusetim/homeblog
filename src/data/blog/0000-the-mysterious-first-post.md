---
title: "The mysterious first post"
description: "Hi"
publication_date: 2025-04-20

---

In the aftermath of a convoluted history, sound cards are one of the most well-supported and common peripherals you can encounter on a PC. Today, the general user can expect to simply plug a 3.5mm (or 2.5mm, if they're fancy) jack in their system and have it work. This dramatically falls appart once you try to do (or build!) something non standard. On the net, information about sound cards is sparse and vastly outdated, dating back to the Sound Blaster era... In this post, I collect knowledge about current computer soundcards, their limitations and some tricks to mitigate them.

This is written at the end of a microphone-building project and has a marked focus towards the input side of the sound card. Also, it is only based on findings from my laptop's sound system. I expect however that most general-purpose sound cards behave similarly.

# Plug-in detection is optional

> Sound cards have a lot of ports, each having some number of channels (usually 2, left and right). However, the number of ADC and DAC is much more limited; typically you'd have only as many as there are channels per port. Therefore, the system needs a way to know which ports should be active, say to choose between the 
> > integrated speakers and earphones. This is achieved by plug-in detection. The jack receptacles have an extra contact. If no jack is plugged in, then the contact is weakly pulled-up but when something is plugged in this extra contact is shorted through the sleeve of the jack to ground. This is detected and allows commutation of the audio paths. (Sometimes the detection contact is normally closed, but the general idea stays the same.)

Plug-in detection is a fully software-defined feature: the sound card exposes the detection status through its interface, and it is up to the driver to choose which are the appropriate ports for the situation. This means that if plug-in detection were to fail (say you replaced your jack plug and the new one doesn't have the extra contact, or the plug-in contact is worn out) you can still choose which ports are active using ALSA utilities. For output, the sound card has a single DAC unit, then the analog signal is routed to multiple power amplifiers, one per output port. You can thus play the same stream through multiple ports. The input situation is less convenient; my card has no hardware mixer, so I can only choose one of the input ports to listen to. I have found that ALSA does not expose the choice of input port when one of them is classified as featuring jack detection. To be able to choose I had to use hdajackretask to trick ALSA into thinking there was no plug-in detection on the microphone input.

```markdown
---
title: My page of content
---
## Introduction

I can link internally to [my conclusion](#conclusion) on the same page when writing Markdown.

## Conclusion

I can visit `https://example.com/page-1/#introduction` in a browser to navigate directly to my Introduction.
```

# Microphone bias circuit

![Microphone bias circuit](https://www.eleves.ens.fr/home/scorbineau/bias.png)

Staying on the topic of microphones, the most common type of microphone (electret microphones) need a bias voltage of a few volts. When this voltage is applied through a bias resistor, sound creates a variable current through the resistor and therefore a measurable voltage. In my system the bias voltage on microphone inputs is 3.1V. The sound chip itself does not have the biasing network -- it only provides a reference voltage. Probing with a multimeter reveals that the bias resistor is 4.7kΩ. More interesting is that the bias voltage is removed when no capture is taking place! This can be a useful indicator for upstream circuitry. The capacitor value is estimated from the transient response obtained when shorting the microphone input. It is somewhat rough, since we need to take into account the sound chip's input impedance (only 64kΩ typical is given) and the effect of the ADC low frequency cutoff (specified as 16Hz). The error should still be at most a factor 2 in either direction. The bias circuitry is the same for both channels, though the bias voltage seems to be applied through two different buffers.

Even when remapping the microphone inputs as "line inputs" with hdajackretask, the bias network is still there. So, laptop microphone inputs may present disappointing input impedances when used as general purpose audio inputs.

# I/O port ranges

Each port has different mechanisms for adjusting their range. All output ports run off the same DAC, which has a fixed reference voltage; it is the power amplifier of each port which has adjustable gain. ALSA exposes a volume fader for each output, and a "Master" fader for overall gain -- this is an abstraction and any combination yielding overall the same gains for all ports is equivalent. The peak output amplitude is just shy of 2V.

The input ports are more complicated. Each ADC has an adjustable reference voltage, which is exposed through the ALSA "Capture" fader. This gain adjustement is fine-grained, with 0.75dB steps (reading datasheets1 it seems there's provision for 0.25dB steps in better cards). Every input has an optional preamp (called "Boost") with coarser steps (12dB in my case, going up to 36dB). The peak input amplitude on the largest scale is 2.1V, just a bit larger than the full-scale output voltage. This allows for quick testing of filters, using an output as a signal generator and an input as the test port. While the impedances are convenient (<1Ω for most output ports, 64kΩ for input ports), ports which are wired as microphone inputs have the bias network spoil their impedance to a few kilo-ohms only.

Interestingly, the Capture fader can be adjusted below 0dB. What happens then? The quantization steps may get larger, but in any case the ADC clips before reaching the maximum output code. The maximum voltage before clipping stays the same as in the 0dB case... This is completely useless!

# Input noise performance

The first thing someone comparing a regular PC soundcard to a well-built external one will notice is the noise. It is bad. In theory, since the sound card has a 16 bit sample depth, you'd expect the noise without input to be on the order of -96dBFS. That's decibels relative to full scale, meaning that this noise would vary in power when adjusting the Capture fader. This is very much not the case in practice however! At 0dB Capture you get -84dBFS. This is a 12dB difference, equivalent to some 2 bits lost. (Some might call it free dithering!) Furthermore, this noise has constant power no matter the Capture fader setting! This means that at greater than 0dB Capture setting, the ADC's internal noise is always much greater than quantization noise. Therefore, there is no point having the Capture fader above 0dB: that only reduces the full scale range!

To drive home how bad the noise is, when connected to a typical electret microphone, the equivalent acoustic noise would be ~54dB(SPL).

Let's look at the noise's spectrum. I recorded the noise of the microphone port when it's unplugged (meaning that only the microphone bias circuit is present). This is similar to the noise one would get with an electret microphone, which has a high impedance. In the figure I plotted both channels, then the average and average-difference's spectrum so that we can see how both channel's noise are correlated.

![Noise spectral density without preamplification](https://www.eleves.ens.fr/home/scorbineau/OC_input_noise.png)

This is some very pink noise :). The pink noise corner frequency is about 5kHz, higher than telephony bandwidth. We also see some spikes indicative of pickup. Repeating the measurement with a shorted input makes them disappear. Most likely these are caused current pulses from the sound chip itself. We can see that the green and red traces are mostly the same, except for the spikes: the channels noises are uncorrelated, except for the current pulses.

The previous measurements were done with the preamp disabled -- let's try enabling it. Here is the same measurement as before, with the maximum 36dB boost:

![Noise spectral density with 36dB preamplification](https://www.eleves.ens.fr/home/scorbineau/preamp_input_noise.png)

What gives? First off, the (broadband) noise is not down by 36dB as one would expect if the only noise source was the ADC, but only by ~10dB. This suggests most of the noise is now coming from the preamp itself or from outside the chip. The noise induced by the current pulses is now clearly visible, unburied from the ADC's noise floor. The noise shows also more correlation across channels, which we can see by the difference trace being lower than the averaged one.

Taking into account spectral folding, the current pulse spikes have very clean ~100Hz separation. If they were due to the acquisition process itself, we'd expect them to be grouped around DC due to spectral folding. All of this makes me suspect they are due to switched-capacitor filters2 in the chip. They are quite steep (19.2kHz passband, then 76dB rejection only one octave up according to the datasheet) which most likely means they have a lot of switching elements apt to create current spikes through insufficient decoupling. They would also have to be run at a higher frequency to be effective anti-aliasing filters.

A working noise model would then be the following:

* The ADC itself introduces uncorrelated noise across the two channels. Its spectrum is given by the first figure above.
* The switched capacitor filter creates current spikes through both inputs equally. This has the effect of creating high-frequency pickup when recording a high-impedance (≥ 1kΩ) source.
* When mitigating the ADC noise with the preamp, the remaining noise is nearly perfectly pink.

Knowing all that, we can devise a protocol to optimize acquisition:

* set the Capture fader to 0dB
* use as much preamplification as you can
* eventually, move the Capture fader a bit to reduce quantization noise. This should not have much of an effect.

If possible, when recording a single channel it is also better to use the left and right microphone inputs as if they were balanced, creating poor man's XLR :D. (I plead guilty.) That gives immunity to the current spike noise and wins a bit more than 3dB due to the broadband noise being somewhat correlated. This should get the best noise performance out of a recording. Distortion might not be the best when using the preamps, but I did not measure it (yet).

The protocol above is markedly not what telephony applications (Discord, Mumble) follow. By default, they try to set maximum Capture and sometimes maximum Boost. Although maximum Boost might be useful as we've seen, moving Capture away from 0dB is mostly useless. With both faders at their maximum gain, the noise itself (nearly) clips!

# Why bother?

General purpose sound stacks are optimized for convenience: input switching is usually handled automatically, microphone biasing is provided and so on. The actual audio performance is not great, but is probably sufficient considering the use case of telephony: the input is going to be heavily digitally processed anyway. For those considering more hackish usage, the information given further up can help extract some more performance and flexibility out of the hardware. A dedicated sound card is always3 going to be better than a built-in one, but they are far less integrated or portable (in the case of laptops). Knowing the limits of your computer's soundcard sets some rough design constraints and working around them allows your projects to reap some of the convenience of a modern sound stack.