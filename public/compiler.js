const instructionMap = new Map();

instructionMap.set("ADD",  0x01);
instructionMap.set("ADDC", 0x02);
instructionMap.set("SUB",  0x03);
instructionMap.set("SUBC", 0x04);
instructionMap.set("AND",  0x06); 
instructionMap.set("OR",   0x07);
instructionMap.set("XOR",  0x08);
instructionMap.set("SLL",  0x09);
instructionMap.set("SRL",  0x0A);
instructionMap.set("SRA",  0x0B);
instructionMap.set("LDL",  0x0C);
instructionMap.set("STL",  0x10);
instructionMap.set("JMP",  0x13);
instructionMap.set("JMPR", 0x14);
instructionMap.set("CALL", 0x15);
instructionMap.set("CALLR",0x16);
instructionMap.set("RET",  0x17);
instructionMap.set("PRNT", 0x18);
instructionMap.set("RBUS", 0x20);
instructionMap.set("WBUS", 0x21);
instructionMap.set("STP",  0x30);

function readFile(file, callback){
    const reader = new FileReader();
    reader.onload = function(event){
        callback(event.target.result);
    }
    reader.readAsText(file);
}

function compile(fileContent){
    const lines = fileContent.split('\n');
    const ints = [];

    for(const line of lines){

        console.log();
        console.log("Reading line: ", line);    

        if(line.includes("//") || line.trim().length === 0)
            continue;

        const parts = line.split(/\s+/).filter(part => part.trim().length > 0);

        console.log("Parts: ", parts);


        if(parts.length != 4) 
            return null;

        const opcodeString = parts[0];
        const operand1 = parseInt(parts[1].substring(2), 16);
        const operand2 = parseInt(parts[2].substring(2), 16);
        const operand3 = parseInt(parts[3].substring(2), 16);
        const opcode = instructionMap.get(opcodeString);

        console.log("opcode: ", opcode);

        if(opcode === undefined)
            return null;

        ints.push(opcode);
        ints.push(operand1);
        ints.push(operand2);
        ints.push(operand3);

    }

    const bytes = new Uint8Array((ints.length/4)*6);

    let j = 0;

    for (let i = 0; i < bytes.length; i += 6) {
        bytes[i] = ints[j] & 0xFF;
        bytes[i + 1] = (ints[j + 1] >> 8) & 0xFF;
        bytes[i + 2] = ints[j + 1] & 0xFF;
        bytes[i + 3] = (ints[j + 2] >> 8) & 0xFF;
        bytes[i + 4] = ints[j + 2] & 0xFF;
        bytes[i + 5] = ints[j + 3] & 0xFF;
        j += 4;
    }

    return bytes;
}

function handleFileUpload(){

    const input = document.getElementById('fileInput');

    if(input.files.length === 0){
        alert("No file selected")
        return;
    }

    const file = input.files[0];
    readFile(file, (content) => {
        updatePreview(content);        
        window.fileContent = content;
        window.fileName = file.name
    })
}

function compileFile(){

    if(!window.fileContent){
        alert("No file selected");
        return;
    }

    const bytes = compile(window.fileContent);
    if(bytes === null){
        alert("Error compiling file bytes=null");
        return;
    }

    const blob = new Blob([bytes], {type: 'application/octet-stream'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = window.fileName.replace('.asm', '.bin');
    a.click();

}

function updatePreview(content) {
    const preview = document.getElementById('filePreview');
    preview.textContent = content;
}
