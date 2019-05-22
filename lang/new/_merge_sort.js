



const first_pass = () => {
    let i = 0;
    for (var c = 0; c < l; c += 2) {
        // Put both in place.
        let left = ta[c];
        let right = ta[c + 1];

        if (c >= l - 1) {
            odd_ta[c] = left;
        } else {
            if (left < right) {
                odd_ta[c] = left;
                odd_ta[c + 1] = right;
            } else {
                odd_ta[c] = right;
                odd_ta[c + 1] = left;
            }
        }
    }
}

//first_pass();



// Not so sure why I have the later passes wrong.
//  Its worth correcting it though.




const second_pass = () => {
    let i = 0;

    const section_size = 4;
    const hgs = 2;
    let wpos = 0;

    // merge sorted lists

    // sections may not exactly be the best way of recognising them

    // (recursively) divide it into sections

    // even try reading it one by one.

    // one by one
    // compare from left and right position
    //  write to place
    // check to see if either l or r have reached the end of the half-section
    //  if so, output the rest of the remaining half of the section to the result


    let il = 0;
    let ir = hgs;

    let l, r;

    let prev_section_num;
    let process_char = () => {

        let section_num = Math.floor(wpos / section_size);

        if (prev_section_num !== section_num) {
            console.log('next section');
            //il += hgs;
            //ir += hgs;
        }

        // 


        console.log('wpos', wpos);
        console.log('section_num', section_num);
        // section r limit
        // section l limit

        let section_l_limit = section_num * section_size;
        let section_r_limit = section_num * section_size + hgs;

        if (section_r_limit > odd_ta.length) {
            console.log('even_ta', even_ta);
            throw 'over length';
        }

        console.log('section_l_limit', section_l_limit);
        console.log('section_r_limit', section_r_limit);

        //let section_l_limit = section_num * section_size;


        // 

        l = odd_ta[il];
        r = odd_ta[ir];

        if (l < r) {
            even_ta[wpos++] = l;
            il++;

            // know what section number we are in

            if (il >= section_l_limit) {
                console.log('reached l limit');
                while (ir < section_r_limit) {
                    r = odd_ta[ir++];
                    even_ta[wpos++] = r;
                }
                //ir += hgs;
                //il += hgs;
            }


        } else {
            even_ta[wpos++] = r;
            ir++;

            if (ir >= section_r_limit) {
                console.log('reached r limit');
                while (il < section_l_limit) {
                    l = odd_ta[il++];
                    even_ta[wpos++] = l;
                }
                //ir += hgs;
                //il += hgs;
            }


        }

        console.log('il', il);
        console.log('ir', ir);

        prev_section_num = section_num;

        console.log('* even_ta', even_ta);

    }

    for (c = 0; c < odd_ta.length; c++) {
        process_char();
    }

    console.log('even_ta', even_ta);

}

//console.log('odd_ta', odd_ta);
//second_pass();
/*

const process_row = (input, output, section_size) => {
    let write_pos = 0;
    let hgs = section_size / 2;

    

    let num_full_iterations = Math.floor(l / section_size);
    let remainder = l % section_size;

    console.log('num_full_iterations', num_full_iterations);
    console.log('remainder', remainder);

    //for (d = 0; d < num_full_iterations; d++) {
        
    //}

    let l_pos = 0;
    let r_pos = hgs;

    console.log('input', input);
    console.log('hgs', hgs);
    
    const process_char = () => {
        let l = input[l_pos];
        let r = input[r_pos];
        if (l < r) {
            output[write_pos++] = l;
            l_pos++;
        } else {
            output[write_pos++] = r;
            r_pos++;
        }
    }



    for (let c = 0; c < section_size; c++) {
        process_char();

        
    }

    console.log('output', output);

}

process_row(ta, odd_ta, 2);
*/


// Multiple steps in merging.

// THEORY - First step involves breaking it apart

// But we can run an algorithm to sort it in place.
// Can recursively call an algorithm to sort smaller parts.
// Recursion seems fine, but it should pass indexes, not create new objects.

// so needs to sort in place, rearranging the typed array.

// Quicksort is in-place.

//