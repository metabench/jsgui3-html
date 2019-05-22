const merge_sort = ta => {



    const even_ta = new Uint16Array(ta.length);
    const odd_ta = new Uint16Array(ta.length);




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
                // Don't split in the middle.

                //let fl_hl = ;

                const midpoint = start + Math.ceil(section_size / 2);
                const endpoint = start + length;

                //console.log('fl_hl', fl_hl);
                console.log('midpoint, endpoint', [midpoint, endpoint]);

                // then need to move through, reading / comparing.

                //for (c = 0; c < )
                let il = start,
                    ir = midpoint;
                //console.log('[il, ir]', [il, ir]);

                //console.log('1) midpoint - il', midpoint - il);
                //console.log('1) endpoint - ir', endpoint - ir);

                // Need to look further at the conditions here.
                while (il < midpoint || ir < endpoint) {
                    //const l = input[il];
                    //const r = input[ir];

                    //console.log('');
                    //console.log('wpos', wpos);
                    //console.log('[il, ir]', [il, ir]);
                    //console.log('[l, r]', [l, r]);
                    //console.log('midpoint', midpoint);
                    //console.log('endpoint', endpoint);
                    if (il === midpoint) {
                        output[wpos++] = input[ir++];
                        //ir++;
                    } else if (ir === endpoint) {
                        output[wpos++] = input[il++];
                        //il++;
                    } else {
                        //console.log('[l, r]', [l, r]);
                        if (input[il] < input[ir]) {
                            output[wpos++] = input[il++];
                            //il++;
                        } else {
                            output[wpos++] = input[ir++];
                            //ir++;
                        }
                    }
                }
                //console.log('2) midpoint - il', midpoint - il);
                //console.log('2) endpoint - ir', endpoint - ir);
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
        const num_passes = Math.ceil(Math.sqrt(ta.length));
        for (let pass_num = 1; pass_num <= num_passes; pass_num++) {
            const pass_section_size = Math.pow(2, pass_num);
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

    /*

    console.log('odd_ta', odd_ta);
    //pass(2, odd_ta, even_ta);

    pass(4, odd_ta, even_ta);
    console.log('even_ta', even_ta);

    console.log('----------------')

    pass(8, even_ta, odd_ta);
    console.log('odd_ta', odd_ta);

    //pass(16, odd_ta, even_ta);
    //console.log('* even_ta', even_ta);

    */
    console.log('ta.length', ta.length);
    console.log('Math.sqrt(ta.length)', Math.sqrt(ta.length));
    console.log('Math.ceil(Math.sqrt(ta.length))', Math.ceil(Math.sqrt(ta.length)));

    console.log('Math.pow(2, Math.ceil(Math.sqrt(ta.length)))', Math.pow(2, Math.ceil(Math.sqrt(ta.length))));

    return multipass();
    //console.log('res', res);
}



const ta = new Uint16Array([12, 5, 4, 9, 13, 14, 11, 2, 1, 1, 14, 3, 4, 5, 18, 2, 1]);

const res = merge_sort(ta);
console.log('res', res);
//const ta = new Uint16Array([12, 5, 4, 11]);
//const ta = new Uint16Array([12, 5, 4, 5, 6, 2]);

// Sorting in stages
// Group size

// This is ctually working now.

// Worth wrapping it as a function.

// I think it's n log n time
// Not using recursion, using 2n extra temporary ram, does not reallocate ram, does not overwrite original.
//  If it overwrote original it would use n extra temp ram.

