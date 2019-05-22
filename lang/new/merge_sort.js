// The V8 sort is about 3 to 4 times faster than this sort.
//  Perhaps this sort would be faster than it in C++ or compiled to wasm.

const merge_sort = ta => {
    const even_ta = new ta.constructor(ta.length);
    const odd_ta = new ta.constructor(ta.length);
    // Maybe a specialised first parse would be best.
    // Should maybe do another attempt of the merge sort.
    // A merge_section function would be useful.
    // Knows what indexes the section comprises of.
    //  Then will put the items in that section together.
    const l = ta.length;

    const pass = (section_size, input, output) => {
        let i = 0;
        //let section_beginning = i;
        let wpos = 0;
        const merge_section = (start, length, section_size) => {
            //console.log('merge_section [start, length]', [start, length]);
            //console.log('section_size', section_size);
            // Only not working on sections shorter than the expected length.

            if (length === 1) {
                output[wpos++] = input[start++];
            } else if (length === 2) {
                if (input[start] < input[start + 1]) {
                    output[wpos++] = input[start++];
                    output[wpos++] = input[start++];
                } else {
                    output[wpos++] = input[start + 1]
                    output[wpos++] = input[start];
                    start += 2;
                }
            } else {
                const midpoint = start + Math.ceil(section_size / 2), endpoint = start + length;
                let il = start,
                    ir = midpoint;
                // Need to handle another case:
                //  Short section lengths, that end before the currently understood midpoint

                //console.log('start + length', start + length);

                //console.log('1) [start, midpoint, il, ir]', [start, midpoint, il, ir]);
                while (il < midpoint || ir < endpoint) {
                    //console.log('2) [start, midpoint, il, ir]', [start, midpoint, il, ir]);
                    if (il >= midpoint) {
                        output[wpos++] = input[ir++];
                    } else if (ir >= endpoint) {
                        output[wpos++] = input[il++];
                        //il++;
                    } else {
                        //console.log('[l, r]', [l, r]);
                        if (input[il] < input[ir]) {
                            output[wpos++] = input[il++];
                        } else {
                            output[wpos++] = input[ir++];
                        }
                    }
                }
            }
        }
        const process_sections = () => {
            while (i < l) {
                let found_section_size = section_size;
                if (i + found_section_size >= l) found_section_size = l - i;
                // but no, we can use the halfway point based on the section size
                //console.log('found_section_size', found_section_size);
                merge_section(i, found_section_size, section_size);
                i += section_size;
            }
        }
        process_sections();
    }

    const multipass = () => {
        console.log('Math.log10(ta.length) / Math.log10(2)', Math.log10(ta.length) / Math.log10(2) / 2);
        const num_passes = Math.ceil(Math.log10(ta.length) / Math.log10(2));
        //const num_passes = Math.round(Math.log2(ta.length) / 2);
        console.log('num_passes', num_passes);

        console.log('Math.log10(ta.length)', Math.log10(ta.length));
        console.log('Math.log2(ta.length)', Math.log2(ta.length));

        for (let pass_num = 1; pass_num <= num_passes; pass_num++) {
            //console.log('pass_num', pass_num);
            const pass_section_size = Math.pow(2, pass_num);
            //console.log('pass_section_size', pass_section_size);
            //let odd = pass_num % 2 === 1;
            if (pass_num % 2 === 1) {
                if (pass_num === 1) {
                    pass(pass_section_size, ta, odd_ta);
                } else {
                    pass(pass_section_size, even_ta, odd_ta);
                }
            } else {
                pass(pass_section_size, odd_ta, even_ta);
            }
        }
        if (num_passes % 2 === 1) {
            return odd_ta;
        } else {
            return even_ta;
        }
    }
    return multipass();
    //console.log('res', res);
}

const gen_ta_random = length => {
    let res = new Uint32Array(length);
    for (let c = 0; c < length; c++) {
        res[c] = Math.round((Math.random()) * 128000);
    }
    return res;
}

const ta = new Uint16Array([12, 5, 4, 9, 13, 14, 11, 2, 1, 1, 14, 3, 4, 5, 18, 2, 1]);

const res = merge_sort(ta);
console.log('res', res);


const longer_ta = gen_ta_random(20000000);
const lta2 = longer_ta.slice();
//const longer_ta = gen_ta_random(64);
let s1 = Date.now();
//console.log('longer_ta',longer_ta);
const res2 = merge_sort(longer_ta);
console.log('t1', Date.now() - s1);
console.log('res2.length', res2.length);
console.log('lta2.length', lta2.length);


let s2 = Date.now();
const res3 = lta2.sort();
console.log('t2', Date.now() - s2);
console.log('res3.length', res3.length);


//const ta = new Uint16Array([12, 5, 4, 11]);
//const ta = new Uint16Array([12, 5, 4, 5, 6, 2]);

// Sorting in stages
// Group size

// This is ctually working now.

// Worth wrapping it as a function.

// I think it's n log n time
// Not using recursion, using 2n extra temporary ram, does not reallocate ram, does not overwrite original.
//  If it overwrote original it would use n extra temp ram.

