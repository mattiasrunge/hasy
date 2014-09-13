# hasy
Home Automation System built on node.js. A system of units, where one unit abstracts a device of some kind, which is controlled by a central state machine system for higher level functions.

## Units
A unit abstracts a device or system of some kind. E.g. a TV, a light source, a Receiver, a Temperature sensor, a Door sensor, a IR Remote control etc.

### TV
A TV has some common functions, these are just some examples.
#### Values
* Source (DTV, HDMI1, HDMI2, ...)
* Power (ON, OFF, DISPLAY_OFF, ...)
* Channel
* Volume (0-100% or 0-255)

#### Events
* Emit: valueChange
* Listen: valueSet

### Light
A light could be a dimmer or just a switch.
#### Values
* Level (0-100% or 0-25)
* Power (ON, OFF)

#### Events
* Emit: valueChange
* Listen: valueSet

### Receiver
A receiver which can decode HDMI signals etc.
#### Values
* Source ( HDMI1, HDMI2, ...)
* Power (ON, OFF, ...)
* Volume (0-100% or 0-255)

#### Events
* Emit: valueChange
* Listen: valueSet

### Door sensor
A sensor that detects if a door or window is open or closed.
#### Values
* State (OPEN, CLOSED)

#### Events
* Emit: valueChange

### Temperature sensor
A sensor that detects the current temperature.
#### Values
* Temperature

#### Events
* Emit: valueChange

### Remote control sensor
A remote control of some kind.
#### Values

#### Events
* Emit: buttonDown (buttonId)
* Emit: buttonUp (buttonId)
* Emit: buttonClicked (buttonId)

### Remote control transmitter
Send signals as a remote control.
#### Values

#### Events
* Listen: buttonDown (buttonId)
* Listen: buttonUp (buttonId)
* Listen: buttonClick (buttonId, [durationMS])

### Kodi (former XBMC)
Receive and control an Kodi instance
#### Values
* nowPlaying (information)
* playing (TRUE, FALSE)
* timeLeft

#### Events
* Listen: playPause
* Listen: playStop
* Listen: buttonDown (buttonId)
* Listen: buttonUp (buttonId)
* Listen: buttonClick (buttonId, [durationMS])

