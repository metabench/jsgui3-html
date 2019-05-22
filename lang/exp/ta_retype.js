let ta = new Uint16Array([2, 3, 1, 3, 4, 8, 3, 2, 7, 2, 4, 1]);

console.log('ta.length', ta.length);

// read it into Uint32Array

const Ui16toUi32 = (ui16) => {
    let res = new Uint32Array(ui16.length / 2);
    let dv = new DataView(ui16.buffer);
    let l = ui16.length;
    let hl = l / 2;
    //console.log('l', l);
    //console.log('hl', hl);
    let resw = 0;
    for (let c = 0; c < hl; c++) {
        //console.log('c', c);
        res[resw++] = dv.getUint32(c * 4);
    }
    //console.log('res', res);
    return res;
}

const Ui32toUi16 = (ui32) => {
    let res = new Uint16Array(ui32.length * 2);
    let dv = new DataView(ui32.buffer);
    let l = ui32.length;
    //let dl = l * 2;
    //console.log('l', l);
    //console.log('dl', dl);
    let resw = 0;
    for (let c = 0; c < l; c++) {
        //console.log('c', c);
        //console.log('dv.getUint16(c)', dv.getUint16(c * 4 + 2));
        //console.log('dv.getUint16(c)', dv.getUint16(c * 4));

        res[resw++] = dv.getUint16(c * 4 + 2);
        res[resw++] = dv.getUint16(c * 4);
        //res[resw++] = dv.getUint16(c * 2 + 1);
        //res[resw++] = dv.getUint16(c * 2);
    }
    console.log('res', res);
    return res;
}

console.log('ta', ta);

let res32 = Ui16toUi32(ta);
console.log('res32', res32);
res32.sort();

let res16 = Ui32toUi16(res32);
console.log('res16', res16);