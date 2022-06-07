let serialPort = {
    port: null,
    inputStream: null,
    reader: null,
    outputStream: null,
    writer: null,
    keepReading: false,
    closedPromise: null,
};

document.addEventListener('DOMContentLoaded', () => {
    const log = document.getElementById('target');
    console.log('ready');

    if ('serial' in navigator) log.innerHTML = "Web Serial Supported.";
    else log.innerHTML = "Web Serial not Supported.";

    document.getElementById('connectSensorButton').addEventListener('click', async () => {
        console.log('button clicked');
        if (navigator.serial) {
            serialPort.keepReading = true;
            serialPort.closedPromise = connectSerial(9600);
        } else {
            alert('Web Serial API not supported.');
        }
    });

    document.getElementById('disconnectSensorButton').addEventListener('click', async () => {
        if (serialPort.port) {
            await disconnectSerial();
            console.log('Serial port has been disconnected.');
            log.innerHTML = 'Serial port disconnected';
        }
        else {
            console.log('Serial port dose not exist.');
        }

    });

    document.getElementById('writeData').addEventListener('click', async () => {
        const writeMessage = document.getElementById('writeMessage').value;

        if (writeMessage) {
            await WriteData(writeMessage);
        }
    })
});


async function connectSerial(baudRate = 9600) {
    const log = document.getElementById('target');
    const serialOptions = {
        baudRate: baudRate,
        bufferSize: 255,
        dataBits: 8,
        flowControl: 'none',
        parity: 'none',
        stopBits: 1,
    };
    console.log(serialOptions);
    try {
        serialPort.port = await navigator.serial.requestPort();
        await serialPort.port.open(serialOptions);
        console.log(serialPort.port.getInfo());
    } catch (error) {
        log.innerHTML = error;
    }
    while (serialPort.port.readable && serialPort.keepReading) {

        const decoder = new TextDecoderStream();

        serialPort.port.readable.pipeTo(decoder.writable);

        serialPort.inputStream = decoder.readable;
        serialPort.reader = serialPort.inputStream.getReader();
        // serialPort.inputStream = serialPort.port.readable;
        // serialPort.reader = serialPort.inputStream.getReader();
        console.log('wait for data coming...');
        while (true) {
            try {
                const { value, done } = await serialPort.reader.read();
                console.log('reading');
                if (value) {
                    log.textContent += value + '\n';
                    console.log(value);
                }
                if (done) {
                    console.log('[readLoop] DONE', done);
                    serialPort.reader.releaseLock();
                    break;
                }
            }
            catch (error) {
                console.log(error);
                break;  //when there's any error occurred,
                //the while-loop shall be killed to release the resource
                //for receiving another useful datas.
                //Otherwise, the program will go into a dead lock.
            }
        }
    }


    if (serialPort.port) {
        serialPort.reader.releaseLock();
        await serialPort.port.close();
    }
}

async function disconnectSerial() {
    const log = document.getElementById('target');
    if (serialPort.keepReading) serialPort.keepReading = false;

    if (serialPort.reader) {
        await serialPort.reader.cancel();
        console.log('reader is canceled');
        log.innerHTML = 'Reader deleted';
    }
    if (serialPort.outputStream) {
        await serialPort.writer.releaseLock();
        await serialPort.outputStream.getWriter.close();
        console.log('Output stream is closed.');
        log.innerHTML = 'Output stream closed';
    }

    await serialPort.closedPromise;
}

async function WriteData(data) {
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.port.writable);
    serialPort.outputStream = textEncoder.writable;
    serialPort.writer = serialPort.outputStream.getWriter();

    try {
        await serialPort.writer.write(data);
        await serialPort.writer.releaseLock();
        console.log('wirte data: ' + data);
    }
    catch(error){
        console.log('ERROR Occurred at function WriteData' + error);
    }
    
}