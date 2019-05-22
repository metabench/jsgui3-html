// Want a basic merge sort function.
//  With my stackless process and own simplification where it gets split up and merged in step 1.

// Split and merge in the first step.
//  At least merge together the results in for the first join in the very first step


const merge_sort = ta => {
    // We basically need 2 more typed arrays of the same length.
    //  Alternate between them in stages
    //   overwrite them each time in a for loop

    console.log('ta', ta);
    const constr = ta.constructor,
        l = ta.length;
    console.log('l', l);


    // Not odd and even.
    //  Still relies on reference swapping in the code.
    //  
    const ta_odd = new constr(l),
        ta_even = new constr(l);


    const stage_one = () => {
        // jump by 2 each time

        // and need to know the last single one
        let c;
        for (c = 0; c < l - 1; c += 2) {
            if (ta[c] < ta[c + 1]) {
                ta_odd[c] = ta[c];
                ta_odd[c + 1] = ta[c + 1];
            } else {
                ta_odd[c] = ta[c + 1];
                ta_odd[c + 1] = ta[c];
            }
        }
        if (c < l) {
            ta_odd[c] = ta[c];
        }

        console.log('c', c);


    }
    stage_one();
    console.log('ta_odd', ta_odd);


    // first stage works really well, it seems.
    //  both splits them up into groups of 2, then reorders them if necessary

    // Then consider 4 numbers at once.


    const process_row = (ta, ta_next, group_size) => {
        console.log('');
        console.log('group_size', group_size);
        const half_group_size = group_size / 2;
        console.log('half_group_size', half_group_size);
        let pos_within_group = 0,
            old_group_num;
        let write_pos = 0;

        // work out the group number.



        let l_read = 0;
        let r_read = l_read + half_group_size;

        let compare = () => {
            let l = ta[l_read];
            let r = ta[r_read];

            if (l < r) {
                ta_next[write_pos++] = l;
                l_read++;
            } else {
                ta_next[write_pos++] = r;
                r_read++;
            }
        }

        compare();
        compare();
        compare();
        compare();

        // then 

        console.log('ta_next', ta_next);
        l_read = group_size;
        r_read = l_read + half_group_size;
        compare();
        compare();
        compare();
        compare();
        console.log('2) ta_next', ta_next);

        l_read = group_size * 2;
        r_read = l_read + half_group_size;
        compare();
        compare();
        compare();
        console.log('3) ta_next', ta_next);

        /*

        for (let c = 0; c < l; c++) {
            let group_num = Math.floor(c / group_size);
            console.log('group_num', group_num);

            if (group_num !== old_group_num) {
                pos_within_group = 0;
            } else {
                pos_within_group++;
            }
            console.log('pos_within_group', pos_within_group);

            


            / *

            if (pos_within_group >= half_group_size) {
                // it's reading from the second half of the group.
            
                // Needs to track a read position instead.

                let corresponding_item_index = c - pos_within_group;
                let left_item = ta[corresponding_item_index];
                let right_item = ta[c];

                

                console.log('[left_item, right_item]', [left_item, right_item]);

                if (left_item < right_item) {
                    ta_next[write_pos++] = left_item;
                    ta_next[write_pos++] = right_item;
                } else {
                    ta_next[write_pos++] = right_item;
                    ta_next[write_pos++] = left_item;
                    
                }

            }
            * /





            old_group_num = group_num;

        }
        */

        console.log('ta_next', ta_next);
    }
    process_row(ta_odd, ta_even, 4);
    //process_row(ta_even, ta_odd, 8);





    // next time around, they are groups of 8 numbers that make 2 pairs of 2.
    // 



    // maximum number of split positions ever...



    /*



    const stage_n = n => {

        let ta_prev, ta_stage;

        if (n % 2 === 0) {
            // even
            console.log('even');
            ta_prev = ta_odd;
            ta_stage = ta_even;
        } else {
            // odd
            console.log('odd');
            ta_prev = ta_even;
            ta_stage = ta_odd;
        }

        // The positions where the splits are...

        // stage 2
        // number of split positions...
        // a b | c
        // a b | c d
        // a b | c d | e
        console.log('n', n);

        // num pairs...

        

        const pair_length = Math.pow(n, 2);
        console.log('pair_length', pair_length);
        const half_pair_length = pair_length / 2;

        // full pairs
        const num_pairs = Math.floor(l / pair_length);
        const remainder = l % pair_length;
        console.log('remainder', remainder);

        console.log('num_pairs', num_pairs);
        // and the reamainder
        // go throughout the pairs

        const merge_pair = (beginning, middle) => {

            console.log('\nmerge_pair', ta_prev);
            console.log('beginning, middle', beginning, middle);
            console.log('pair_length', pair_length);

            let i_left = beginning;
            let i_right = middle;
            let w = beginning;

            while (i_left <= beginning + half_pair_length && i_right <= beginning + pair_length) {
                // put them into the present row.
                console.log('i_left', i_left);
                console.log('i_right', i_right);

                if (ta_prev[i_left] < ta_prev[i_right]) {
                    ta_stage[w++] = ta_prev[i_left++];
                } else {
                    ta_stage[w++] = ta_prev[i_right++];
                }
            }
            console.log('post loop ta_stage ', ta_stage);
        }

        for (var i_pair = 0; i_pair <= num_pairs; i_pair++) {
            // the index of the pair beginning.

            const i_pair_beginning = pair_length * i_pair;
            console.log('i_pair_beginning', i_pair_beginning);
            const i_pair_middle = i_pair_beginning + half_pair_length;
            console.log('i_pair_middle', i_pair_middle);

            merge_pair(i_pair_beginning, i_pair_middle);
            console.log('ta_stage', ta_stage);

            // then merge the pair together.



        }


        // stage 2
        // 



        //let num_split_positions = 





    }
    stage_n(2);

    */



    const _stage_n = n => {
        const sorted_part_size = Math.pow(2, n);
        console.log('sorted_part_size', sorted_part_size);

        let ta_prev, ta_stage;

        if (n % 2 === 0) {
            // even
            console.log('even');
            ta_prev = ta_odd;
            ta_stage = ta_even;
        } else {
            // odd
            console.log('odd');
            ta_prev = ta_even;
            ta_stage = ta_odd;
        }

        let c;
        const h_sps = sorted_part_size / 2;

        console.log('ta_prev', ta_prev);
        console.log('sorted_part_size', sorted_part_size);
        for (c = 0; c < l - h_sps; c += sorted_part_size) {

            // Need to merge the two array halves together.
            //  ie sort them



            let pos_l = 0,
                pos_r = 0,
                pos_w = c;
            let lookup_l, lookup_r;
            // but also need to read these items from those positions.

            console.log('h_sps', h_sps);

            // then a second loop

            while (pos_l < h_sps && pos_r < h_sps) {

                console.log('pos_l, pos_r', [pos_l, pos_r]);

                lookup_l = c + pos_l;
                lookup_r = c + pos_r + h_sps;


                console.log('lookup_l, lookup_r', [lookup_l, lookup_r]);
                console.log('ta_prev[lookup_l], ta_prev[lookup_r]', [ta_prev[lookup_l], ta_prev[lookup_r]]);

                if (ta_prev[lookup_l] < ta_prev[lookup_r]) {
                    ta_stage[pos_w++] = ta_prev[lookup_l];
                    pos_l++;
                } else {
                    ta_stage[pos_w++] = ta_prev[lookup_r];
                    pos_r++;
                }



                // need to do comparison.

                // compare from the different positions.
                //  this needs to rely on index lookups.


                //i//f ()


            }


            /*

            if (ta[c] < ta[c + 1]) {
                ta_odd[c] = ta[c];
                ta_odd[c + 1] = ta[c + 1];
            } else {
                ta_odd[c] = ta[c + 1];
                ta_odd[c + 1] = ta[c];
            }
            */
        }

        console.log('ta_stage', ta_stage);

        /*
        if (c < l) {
            ta_odd[c] = ta[c];
        }
        */

        console.log('c', c);

    }

    //stage_n(2);



}



if (require.main === module) {

    // Require a database path / choose a default path
    //  Easiest setup possible is best, allow config options too

    //console.log('process.argv', process.argv);
    const ta = new Uint16Array([12, 5, 4, 9, 13, 14, 11, 8, 2, 1, 1]);
    //const ta = new Uint16Array([12, 5, 4, 9, 13, 14, 11, 8, 2, 1]);

    const sorted = merge_sort(ta);
    console.log('sorted', sorted);

} else {
    //console.log('required as a module');
}