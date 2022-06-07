let serialPort = {
    port:null,
    inputStream:null,
    reader:null,
    outputStream:null,
};

document.addEventListener('DOMContentLoaded',()=>{
    const log = document.getElementById('target');
    console.log('ready');
    document.getElementById('connectButton').addEventListener('click',()=>{
        console.log('button clicked');
        if (navigator.serial) {
            connectSerial();
        } else {
            alert('Web Serial API not supported.');
        }
    });

    document.getElementById('disconnectButton').addEventListener('click',()=>{
        if(serialPort.port){
            disconnectSerial();
            console.log('Serial port has been disconnected.');
            log.innerHTML = 'Serial port disconnected';
        }
        else{
            console.log('Serial port dose not exist.');
        }
        
    })
});


async function connectSerial() {
    const log = document.getElementById('target');
      
    try {
        serialPort.port = await navigator.serial.requestPort();
        await serialPort.port.open({ baudRate: 19200 });
      
        const decoder = new TextDecoderStream();
      
        serialPort.port.readable.pipeTo(decoder.writable);
  
        serialPort.inputStream = decoder.readable;
        serialPort.reader = serialPort.inputStream.getReader();
      
        while (true) {
            const { value, done } = await serialPort.reader.read();
            if (value) {
                log.textContent += value + '\n';
            }
            if (done) {
                console.log('[readLoop] DONE', done);
                serialPort.reader.releaseLock();
                break;
            }
      }
    
    } catch (error) {
      log.innerHTML = error;
    }
}

async function disconnectSerial(){
    const log = document.getElementById('target');

    if(serialPort.reader){
        await serialPort.reader.cancel();
        console.log('reader is canceled');
        log.innerHTML = 'Reader deleted';
    }
    if(serialPort.outputStream){
        await serialPort.outputStream.getWriter.close();
        console.log('Output stream is closed.');
        log.innerHTML = 'Output stream closed';
    }
}