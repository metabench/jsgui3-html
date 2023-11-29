const jsgui = require('../html');

const {Blank_HTML_Document, controls, Control} = jsgui;


const test_doc_html_generation = () => {

    class Demo_UI extends Blank_HTML_Document {
        constructor(spec = {}) {



            spec.__type_name = spec.__type_name || 'demo_ui';
            super(spec);
            const {context} = this;

            if (typeof this.body.add_class === 'function') {
                this.body.add_class('demo-ui');
            }

            // Want something that uses a compositional model to describe the composition of a control.
            //   Or multiple controls.

            // Make the example on the server for the moment.

            /*


            const compose = () => {
                const num_windows = 5;

                let [x, y] = [0, 0];
                for (let c = 1; c <= num_windows; c++) {
                    const window = new controls.Window({
                        context: context,
                        title: c + ') jsgui3-html Window Control',
                        pos: [x, y]
                    })
                    this.body.add(window);

                    x += 32; y += 64;
                }

            }
            if (!spec.el) {
                compose();
            }
            */
        }
    }





    let l = 0;
    let c = 0;

    // And even render it 10 times in a loop?

    const single_run = () => {



        const doc = new Demo_UI();
        const html = doc.render();
        l = l + html.length;
        c++;


    }

    //const num_iterations = 1024 * 16;

    // 256 seems like an OK amount here.




    const num_iterations = 256;

    let t1, t2, tdiff;
    t1 = Date.now();
    for (let i = 0; i < num_iterations; i++) {
        single_run();
    }
    t2 = Date.now();
    tdiff = t2 - t1;
    console.log('tdiff', tdiff);
    console.log('tdiff / 1000', tdiff / 1000);

    console.log('l', l);

    // 128 operations in tdiff / 1000 seconds...

    const rate_per_second = (num_iterations / (tdiff / 1000)).toFixed(2);
    console.log('rate_per_second', rate_per_second);
    // Maybe rate per second should be sped up, but it may be most useful to detect if changes ruin the speed somehow.
    //   Want to see where some lower level changes can make some mid and high level code faster and more concise to read, write
    //   and compress too.






    // Provides some basic perf info here.




    

    //console.log('html', html);


    

}

if (require.main === module) {
    test_doc_html_generation();
}






