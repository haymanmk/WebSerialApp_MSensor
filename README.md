# WebSerialApp_MSensor
This web app is used to configure M-sensor testing rig automatically via serial port.
# Preliminary
This Web API is only supoported on the Google chrome-based browser including Microsoft Edge. If you are not sure about which browser supports this API, please go ahead to next topic.
# Feature detection
To check if the Web Serial API is supported, use:
```
if ("serial" in navigator) {
  // The Web Serial API is supported.
}
```
Or open browser and press "F12" to open a terminal, then type in
```
'serial' in navigator
```
if browser supports Serial API, it shall return 'true' as shown below.
```
> 'serial' in navigator
<- true
```