//const htmlparser = require('htmlparser');

// htmlparser2
//  faster? used in cheerio (like jQuery)

// page_context.map_Ctrls
//  then it will create the controls using the appropriate constructors.

// It's appropriate to make this before making the Business Suite controls.

// Mount content into a control - meaning the control itself would need to be changed.

// parse_mount function will just create the controls.
//  they could then be put into a DOM.

var htmlparser = require("htmlparser");
const {tof, each} = require('lang-mini');

// Maybe redo this, making use of a recursion function.

// Just parse and add?
// Parse and instantiate?
// Parse and construct?

const log = () => {}

// Need a map of all controls that are available to use.
//  This gets given as 3rd parameter.

// Probably need to treat this as async right now.
//  Could even make it new style observable async.

// Want to be able to parse it, but not mount it to a target.

// parse function needs to know the context
//  parse, init?
//  parse create?

// just call it parse for the moment.

// Strange that the new version is broken.
//  Maybe its got to do with timings / syncronicity.

// Possibly the part that calls it needs to operate in an async way?
//  Wonder if this has introduced any more delays?

// parse function using a callback...
//  needs a callback too.
//  runs immediately though.

const parse = function(str_content, context, control_set, callback) {
    str_content = str_content.trim();

    const handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            log('parse error', error);
        }
            //[...do something for errors...]
        else {
            log('dom', dom);
            // Then can recurse through the dom object.
            //  Nice that it parses non-standard elements.

            // depth-first recursion for creation of the elements.
            //  Then will add them to the parents as they get created.
            // replace the children with controls?

            // when doing 

            let recurse = (dom, depth, callback) => {
                let tdom = tof(dom);
                let res;
                log('tdom', tdom);
                log('dom item', dom);

                if (tdom === 'array') {
                    //res = [];
                    each(dom, v => {
                        //res.push(recurse)
                        recurse(v, depth + 1, callback);

                        // then later (depth first) callback
                        callback(v, depth);

                    })
                } else if (tdom === 'object') {
                    if (dom.children) {
                        each(dom.children, child => {
                            recurse(child, depth + 1, callback);

                            callback(child, depth);
                        })
                    }
                } else {
                    log('dom', dom);
                }
            }
            // want to create the items as well.
            //  start with innermost, adding the child controls to the outer ones.
            //   need to be able to run controls from these strings which come as templates.
            //   eliminate the need for much of the control construction code, at least make it much more concise.

            /*
            const new_ctrl_made = (ctrl) => {
                // this will need to assemble to controls into a heirachy.
                //  May need to know the depth so to know which to join together.

                // includes text controls
            }
            */

            // handle text
            //  should know what level the text is at
            //   needs to know when the level decreases so we can put the children in the parent.

            let last_depth = 0;

            // maybe need a map of siblings at depth
            //let child_nodes = [];
            // siblings in a list, children in a list?
            //  or only need one list with depth-first?
            // can build it up within the closure.

            // sounds like we need it as we add to the tree at different depths.
            // map of open arrays at different depths?

            // need to push the text node at the depth.

            let map_siblings_at_depth = {};
            // Then when moving up a depth we nullify the array
            //  Then moving down the depth we create a new array.
            //  Do this for controls.
            //  Including text controls.

            let res_controls = {};

            // return res_controls as well...?
            //  makes sense

            const handle_text = (text, depth) => {

                //child_nodes.push(text);

                // Maybe don't need the text node control here.
                //  When we have the text as a single child, we can declare it as a property.
                //  However, the full text node instantiation makes sense for not taking shortcuts.

                let tn = new control_set.Text_Node({
                    text: text,
                    context: context
                });

                //log('tn', tn);
                //log('text', text);
                //log('tn instanceof Text_Node', tn instanceof control_set.Text_Node);
                //log('tn.text', tn.text);
                //log('tn._text', tn._text);
                //throw 'stop';
                res_controls.unnamed = res_controls.unnamed || [];
                res_controls.unnamed.push(tn);
                // push it into siblings at depth too.
                map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                map_siblings_at_depth[depth].push(tn);

                // doesn't have a name though.
                //  there will be other unnamed controls that should be returned in the results.
                // The names maybe will not be so important.

                last_depth = depth;
            }

            // an array of siblings at levels
            //  then remove? the array when going up a level, use it as the children for a node?

            // need to be able to start up a node while specifying its content?
            //  including the content in the spec could work well.
            //   

            // Get rid of the span rendering shortcut?
            //  Always use the textNode?
            //  Have the .text property a shortcut to modifying that text node?

            // Span .text is really convenient in many cases.
            // Spans can contain other elements so it's worth being careful.

            // The .text shortcut looks like its not carrying out the underlying dom functionality.
            //  Better to have it do the underlying dom tasks properly, and then have sugar around that.

            // So don't have special rendering for the span element.
            // Divs / controls can take text nodes too.

            // Maybe have .text read-only.
            //  .set_text too?
            //  .set_text for convenience in some situations.
            //   In other situations, we use proper text nodes alongside whatever else goes inside a span.

            // the .text set and get property could stay for convienience.
            //  It needs to deal with textNode object underneith though.

            // General route is to handle things in the conventional DOM way on a lower level
            //  Then on a higher level there will be systems of convenience for the programmer.

            // So setting text will replace the content.
            //  Get rid of the specialised span rendering.
            //  Get rid of text property for the moment?
            //   Or have it do its stuff on a lower level.


            const handle_tag = (tag, depth) => {
                //console.log('handle_tag tag', tag);
                const tag_with_no_children = {};
                if (tag.raw) tag_with_no_children.raw = tag.raw;
                if (tag.data) tag_with_no_children.data = tag.data;
                if (tag.type) tag_with_no_children.type = tag.type;
                if (tag.name) tag_with_no_children.name = tag.name;
                if (tag.attribs) tag_with_no_children.attribs = tag.attribs;

                // Then the name property - need to use these named controls to set the control's _ctrl_fields

                //log('handle_tag tag_with_no_children', tag_with_no_children);
                // maybe pass through the tag with no children. the children have been made into controls.

                // will add to the collection of siblings.
                // has the depth increased?
                // create control...

                // and the children? content
                const create_ctrl = (tag, content) => {
                    if (control_set[tag.name]) {
                        //log('has jsgui control for ' + tag.name);
    
                        // need to look into if there are child jsgui controls within this.
    
                        let Ctrl = control_set[tag.name];
                        // work out the spec as well.
                        log('tag', tag);
                        let a = tag.attribs || {};

                        // Why isnt content working in the spec?
                        //  Expecially with a Text_Node?


                        if (content) a.content = content;

                        // A 'content' attribute?
                        //log('content.length', content.length);

                        each(content, item => {
                            //log('content item', item);
                            //log('Object.keys(content item)', Object.keys(item));
                            //log('(content item.__type_name)', (item.__type_name));
                            //log('(content item._text)', (item._text));
                            //log('(content item.text)', (item.text));
                        })

                        // want an easier way to view the content.
                        //  don't want large printouts of the jsgui controls.

                        log('attribs a', a);
                        log('\n\n');
                        //log('!!target', !!target);
                        //log('!!target.context', !!target.context);
                        a.context = context;
    

                        // Some DOM attributes not recognised in ctrl construction.
                        //  Could make it so that controls apply unknown attributes to the DOM.
                        //   Or put in a 'dom attributes' part of the spec?
                        //   May be better that way.


                        let ctrl = new Ctrl(a);
                        if (a.name) {
                            res_controls.named = res_controls.named || {};
                            res_controls.named[a.name] = ctrl;

                            // Expected behaviour to replace existing composition code.

                            //target[a.name] = ctrl;

                            //res_controls[a.name] = ctrl;
                        } else {
                            res_controls.unnamed = res_controls.unnamed || [];
                            res_controls.unnamed.push(ctrl);
                        }

                        // Then the rest of the read attributes go as dom attributes...?
                        //  But dont do that with some particular attributes.

                        // jsgui system attributes:
                        //  name
                        //   class?
                        //    yes it gets handles internally by the ctrl.

                        const map_jsgui_attr_names = {
                            'name': true,
                            'class': true,
                            'content': true,
                            '__type_name': true,
                            'context': true
                        }


                        const arr_dom_attrs = [];
                        each(a, (a_value, a_name) => {
                            //console.log('a_value, a_name', [a_value, a_name]);

                            if (!map_jsgui_attr_names[a_name]) {
                                arr_dom_attrs.push([a_name, a_value])
                            }


                        })

                        //console.log('arr_dom_attrs', arr_dom_attrs);

                        each(arr_dom_attrs, attr => {
                            const [name, value] = attr;
                            ctrl.dom.attributes[name] = value;
                        });


                        // and unnamed controls
                        //  an array of them...
    
                        // The name property - possibly name could be stored by the control itself.
                        //  Different to its id.
    
                        //log('!!ctrl', !!ctrl);
                        //log('depth', depth);

                        return ctrl;
                    } else {
                        // The app's controls need to be loaded / registered previous to this.
                        //log('lacking jsgui control for ' + tag.name);

                        // The server app should register it?

                        //console.log('tag', tag);
                        console.trace();
                        throw 'lacking jsgui control for ' + tag.name;
                    }
                }

                // create the control at this stage?
                //  having a 'content' or 'children' property could work well here.
                //  setting .content would make sense well.

                let my_children;
                let ctrl;

                if (depth > last_depth) {

                    // Likely will happen.
                    //  The fix I put in got lost before.
                    //  It does not need to do that much where there are no child nodes.

                    

                    ctrl = create_ctrl(tag_with_no_children);
                    //map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    map_siblings_at_depth[depth] = []; // because its a new depth?
                    map_siblings_at_depth[depth].push(ctrl);

                    console.log('depth > last_depth [depth, last_depth]', [depth, last_depth]);
                    console.trace();
                    //throw 'NYI';

                    // Not sure how this will happen as the depth should move outwards?
                    //  Will need to check / measure recursion order.

                    // depth increase.
                    //  means moving to new child.
                    //   this does depth first, but starting from the first.
                    //    not sure that makes sense, need to check that it works.

                    // 
                    map_siblings_at_depth[depth] = [];

                    // but need to add the item.
                    //map_siblings_at_depth[depth].push();

                    //log('child_nodes', child_nodes);

                    //child_nodes = [];


                } else if (depth < last_depth) {

                    //log('child_nodes', child_nodes);
                    // create the control.

                    //child_nodes = [];
                    // my children in array!!!
                    //log('last_depth', last_depth);

                    my_children = map_siblings_at_depth[last_depth];
                    //log('my_children', my_children);

                    //throw 'stop';

                    if (my_children) {
                        //log('my_children.length', my_children.length);
                        ctrl = create_ctrl(tag_with_no_children, my_children);
                    } else {
                        ctrl = create_ctrl(tag_with_no_children);
                    }
                    //log('ctrl.content._arr.length', ctrl.content._arr.length);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    // do we need to keep these child controls now?
                    //  prob best not to.
                    map_siblings_at_depth[last_depth] = null;
                    map_siblings_at_depth[depth].push(ctrl);

                    // create the ctrl including the content.

                    // create the control with the children.
                    //  maybe just say they are 'content'.

                    // being able to choose content subcontrols at declaration seems very important here.


                } else {
                    ctrl = create_ctrl(tag_with_no_children);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[depth].push(ctrl);

                    // I think that means that this one doesn't have children either.
                    // same depth - sibling
                    //  create a new control.
                    //   I think this means that the last control in the loop had no subcontrols.
                    // Will need to observe the algo in operation to make sure it works correctly.
                    //child_nodes.push(tag)

                }
                // Create a control out of the tag
                last_depth = depth;
            }

            // goes depth-first.
            recurse(dom, 0, (item, depth) => {
                //log('item', item);
                //log('depth', depth);

                // analyse the item
                //  is it an element (tag)?

                if (item.type === 'text') {
                    // These don't have children
                    //  They are also the inner-most.
                    // create a jsgui text node.
                    //log('text item', item);
                    // trim it

                    let trimmed = item.data.trim();
                    //log('trimmed', trimmed);
                    //log('trimmed.length', trimmed.length);

                    if (trimmed.length > 0) {
                        handle_text(item.raw, depth);
                    }
                    // Need to rapidly 
                } else if (item.type === 'tag') {
                    // does it have children?
                    // if not, create a control from the children.
                    // then if it does, what are its control children?

                    //log('tag item', item);
                    //log('item.children.length', item.children.length);

                    handle_tag(item, depth);

                    /*
                    if (!item.children) {
                        log('no children item', item);
                        throw 'stop';
                    }
                    */

                }
            });
            // Really not that good parse-mount being async.
            //  May need to fix that for it to work.
            //   Composition should be instant, but does not need to return a value.

            // Would be best to separate out the parsing.
            //
            // the parse result is the depth 0 controls.

            const depth_0_ctrls = map_siblings_at_depth[0];
            callback(null, [depth_0_ctrls, res_controls]);
            
        }
            //[...parsing done, do something...]
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(str_content);

}

const _parse = function(str_content, context, control_set) {

    // Well this needs to be a promise or observable.
    //  Observable could be cool...?

    str_content = str_content.trim();
    return new Promise((solve, jettison) => {
        const handler = new htmlparser.DefaultHandler(function (error, dom) {
            if (error) {
                log('parse error', error);
            }
                //[...do something for errors...]
            else {
                log('dom', dom);
                // Then can recurse through the dom object.
                //  Nice that it parses non-standard elements.
    
                // depth-first recursion for creation of the elements.
                //  Then will add them to the parents as they get created.
                // replace the children with controls?
    
                // when doing 
    
                let recurse = (dom, depth, callback) => {
                    let tdom = tof(dom);
                    let res;
                    log('tdom', tdom);
                    log('dom item', dom);
    
                    if (tdom === 'array') {
                        //res = [];
                        each(dom, v => {
                            //res.push(recurse)
                            recurse(v, depth + 1, callback);
    
                            // then later (depth first) callback
                            callback(v, depth);
    
                        })
                    } else if (tdom === 'object') {
                        if (dom.children) {
                            each(dom.children, child => {
                                recurse(child, depth + 1, callback);
    
                                callback(child, depth);
                            })
                        }
                    } else {
                        log('dom', dom);
                    }
                }
                // want to create the items as well.
                //  start with innermost, adding the child controls to the outer ones.
                //   need to be able to run controls from these strings which come as templates.
                //   eliminate the need for much of the control construction code, at least make it much more concise.
    
    
                /*
                const new_ctrl_made = (ctrl) => {
                    // this will need to assemble to controls into a heirachy.
                    //  May need to know the depth so to know which to join together.
    
                    // includes text controls
                }
                */
    
                // handle text
                //  should know what level the text is at
                //   needs to know when the level decreases so we can put the children in the parent.
    
                let last_depth = 0;
    
                // maybe need a map of siblings at depth
                //let child_nodes = [];
                // siblings in a list, children in a list?
                //  or only need one list with depth-first?
                // can build it up within the closure.
    
                // sounds like we need it as we add to the tree at different depths.
                // map of open arrays at different depths?
    
                // need to push the text node at the depth.
    
                let map_siblings_at_depth = {};
                // Then when moving up a depth we nullify the array
                //  Then moving down the depth we create a new array.
                //  Do this for controls.
                //  Including text controls.
    
                let res_controls = {};

                // return res_controls as well...?
                //  makes sense


    
                const handle_text = (text, depth) => {
    
                    //child_nodes.push(text);
    
                    // Maybe don't need the text node control here.
                    //  When we have the text as a single child, we can declare it as a property.
                    //  However, the full text node instantiation makes sense for not taking shortcuts.
    
                    let tn = new control_set.Text_Node({
                        text: text,
                        context: context
                    });
    
                    //log('tn', tn);
                    //log('text', text);
                    //log('tn instanceof Text_Node', tn instanceof control_set.Text_Node);
                    //log('tn.text', tn.text);
                    //log('tn._text', tn._text);
                    //throw 'stop';
                    res_controls.unnamed = res_controls.unnamed || [];
                    res_controls.unnamed.push(tn);
                    // push it into siblings at depth too.
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[depth].push(tn);
    
                    // doesn't have a name though.
                    //  there will be other unnamed controls that should be returned in the results.
                    // The names maybe will not be so important.
    
                    last_depth = depth;
                }
    
                // an array of siblings at levels
                //  then remove? the array when going up a level, use it as the children for a node?
    
                // need to be able to start up a node while specifying its content?
                //  including the content in the spec could work well.
                //   
    
                // Get rid of the span rendering shortcut?
                //  Always use the textNode?
                //  Have the .text property a shortcut to modifying that text node?
    
                // Span .text is really convenient in many cases.
                // Spans can contain other elements so it's worth being careful.
    
                // The .text shortcut looks like its not carrying out the underlying dom functionality.
                //  Better to have it do the underlying dom tasks properly, and then have sugar around that.
    
                // So don't have special rendering for the span element.
                // Divs / controls can take text nodes too.
    
                // Maybe have .text read-only.
                //  .set_text too?
                //  .set_text for convenience in some situations.
                //   In other situations, we use proper text nodes alongside whatever else goes inside a span.
    
                // the .text set and get property could stay for convienience.
                //  It needs to deal with textNode object underneith though.
    
                // General route is to handle things in the conventional DOM way on a lower level
                //  Then on a higher level there will be systems of convenience for the programmer.
    
                // So setting text will replace the content.
                //  Get rid of the specialised span rendering.
                //  Get rid of text property for the moment?
                //   Or have it do its stuff on a lower level.
    
    
                const handle_tag = (tag, depth) => {
                    //console.log('handle_tag tag', tag);
                    const tag_with_no_children = {};
                    if (tag.raw) tag_with_no_children.raw = tag.raw;
                    if (tag.data) tag_with_no_children.data = tag.data;
                    if (tag.type) tag_with_no_children.type = tag.type;
                    if (tag.name) tag_with_no_children.name = tag.name;
                    if (tag.attribs) tag_with_no_children.attribs = tag.attribs;
    
                    // Then the name property - need to use these named controls to set the control's _ctrl_fields
    
                    //log('handle_tag tag_with_no_children', tag_with_no_children);
                    // maybe pass through the tag with no children. the children have been made into controls.
    
                    // will add to the collection of siblings.
                    // has the depth increased?
                    // create control...
    
                    // and the children? content
                    const create_ctrl = (tag, content) => {
                        if (control_set[tag.name]) {
                            //log('has jsgui control for ' + tag.name);
        
                            // need to look into if there are child jsgui controls within this.
        
                            let Ctrl = control_set[tag.name];
                            // work out the spec as well.
                            log('tag', tag);
                            let a = tag.attribs || {};
    
                            // Why isnt content working in the spec?
                            //  Expecially with a Text_Node?
                            if (content) a.content = content;
                            //log('content.length', content.length);
    
                            each(content, item => {
                                //log('content item', item);
                                //log('Object.keys(content item)', Object.keys(item));
                                //log('(content item.__type_name)', (item.__type_name));
                                //log('(content item._text)', (item._text));
                                //log('(content item.text)', (item.text));
                            })
    
                            // want an easier way to view the content.
                            //  don't want large printouts of the jsgui controls.
    
                            log('attribs a', a);
                            log('\n\n');
                            //log('!!target', !!target);
                            //log('!!target.context', !!target.context);
                            a.context = context;
        
                            let ctrl = new Ctrl(a);
                            if (a.name) {
                                res_controls.named = res_controls.named || {};
                                res_controls.named[a.name] = ctrl;
    
                                // Expected behaviour to replace existing composition code.

                                //target[a.name] = ctrl;
    
                                //res_controls[a.name] = ctrl;
                            } else {
                                res_controls.unnamed = res_controls.unnamed || [];
                                res_controls.unnamed.push(ctrl);
                            }
                            // and unnamed controls
                            //  an array of them...
        
                            // The name property - possibly name could be stored by the control itself.
                            //  Different to its id.
        
                            //log('!!ctrl', !!ctrl);
                            //log('depth', depth);
    
                            return ctrl;
                        } else {
                            // The app's controls need to be loaded / registered previous to this.
                            //log('lacking jsgui control for ' + tag.name);
    
                            // The server app should register it?
    
    
                            //console.log('tag', tag);
                            console.trace();
    
                            throw 'lacking jsgui control for ' + tag.name;
                        }
                    }
    
                    // create the control at this stage?
                    //  having a 'content' or 'children' property could work well here.
                    //  setting .content would make sense well.
    
                    let my_children;
                    let ctrl;
    
                    if (depth > last_depth) {
    
                        // Likely will happen.
                        //  The fix I put in got lost before.
                        //  It does not need to do that much where there are no child nodes.
    
                        
    
                        ctrl = create_ctrl(tag_with_no_children);
                        //map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
    
                        map_siblings_at_depth[depth] = []; // because its a new depth?
                        map_siblings_at_depth[depth].push(ctrl);
    
                        console.log('depth > last_depth [depth, last_depth]', [depth, last_depth]);
                        console.trace();
                        //throw 'NYI';
    
                        // Not sure how this will happen as the depth should move outwards?
                        //  Will need to check / measure recursion order.
    
                        // depth increase.
                        //  means moving to new child.
                        //   this does depth first, but starting from the first.
                        //    not sure that makes sense, need to check that it works.
    
                        // 
                        map_siblings_at_depth[depth] = [];
    
                        // but need to add the item.
                        //map_siblings_at_depth[depth].push();
    
                        //log('child_nodes', child_nodes);
    
                        //child_nodes = [];
    
    
                    } else if (depth < last_depth) {
    
                        //log('child_nodes', child_nodes);
                        // create the control.
    
                        //child_nodes = [];
                        // my children in array!!!
                        //log('last_depth', last_depth);
    
                        my_children = map_siblings_at_depth[last_depth];
                        //log('my_children', my_children);
    
                        //throw 'stop';
    
                        if (my_children) {
                            //log('my_children.length', my_children.length);
                            ctrl = create_ctrl(tag_with_no_children, my_children);
                        } else {
                            ctrl = create_ctrl(tag_with_no_children);
                        }
                        //log('ctrl.content._arr.length', ctrl.content._arr.length);
                        map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
    
                        // do we need to keep these child controls now?
                        //  prob best not to.
                        map_siblings_at_depth[last_depth] = null;
                        map_siblings_at_depth[depth].push(ctrl);
    
                        // create the ctrl including the content.
    
                        // create the control with the children.
                        //  maybe just say they are 'content'.
    
                        // being able to choose content subcontrols at declaration seems very important here.
    
    
                    } else {
                        ctrl = create_ctrl(tag_with_no_children);
                        map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                        map_siblings_at_depth[depth].push(ctrl);
    
                        // I think that means that this one doesn't have children either.
                        // same depth - sibling
                        //  create a new control.
                        //   I think this means that the last control in the loop had no subcontrols.
                        // Will need to observe the algo in operation to make sure it works correctly.
                        //child_nodes.push(tag)
    
                    }
                    // Create a control out of the tag
                    last_depth = depth;
                }
    
                // goes depth-first.
                recurse(dom, 0, (item, depth) => {
                    //log('item', item);
                    //log('depth', depth);
    
                    // analyse the item
                    //  is it an element (tag)?
    
                    if (item.type === 'text') {
                        // These don't have children
                        //  They are also the inner-most.
                        // create a jsgui text node.
                        //log('text item', item);
                        // trim it
    
                        let trimmed = item.data.trim();
                        //log('trimmed', trimmed);
                        //log('trimmed.length', trimmed.length);
    
                        if (trimmed.length > 0) {
                            handle_text(item.raw, depth);
                        }
                        // Need to rapidly 
                    } else if (item.type === 'tag') {
                        // does it have children?
    
                        // if not, create a control from the children.
    
                        // then if it does, what are its control children?
    
                        //log('tag item', item);
                        //log('item.children.length', item.children.length);
    
                        handle_tag(item, depth);
    
                        /*
                        if (!item.children) {
                            log('no children item', item);
                            throw 'stop';
                        }
                        */
    
                    }
                });
                // Really not that good parse-mount being async.
                //  May need to fix that for it to work.
                //   Composition should be instant, but does not need to return a value.
    
                // Would be best to separate out the parsing.
                //
                // the parse result is the depth 0 controls.
    
                const depth_0_ctrls = map_siblings_at_depth[0];
                solve([depth_0_ctrls, res_controls]);
                
            }
                //[...parsing done, do something...]
        });
        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(str_content);
    })

}


// Not sure why this separation breaks things.
//  Timing - cant be async, needs to be immediate with callback. Cant await the parsing promise and have it work.


// Maybe change back to old parse_mount and fix tomorrow?
//  Or parse function will always / just use a callback?




const parse_mount = function(str_content, target, control_set) {

    // And this should be a promise too, it seems.
    //  Not so sure though.
    //  Promise puts in some kind of a delay.

    // Maybe this fn would be better with a callback too.


    return new Promise(async(solve, jettison) => {
        let container;
        let a = arguments;
        let l = a.length;
        if (l === 4) {
            container = a[2];
            control_set = a[3];
        } else {
            container = target;
        }
        const {context} = target;

        // And make it async to announce when it's complete?
        //  Won't take long though.

        //const [depth_0_ctrls, res_controls] = await parse(str_content, context, control_set);

        parse(str_content, context, control_set, (err, res_parse) => {
            if (err) {
                jettison(err);
            } else {

                const [depth_0_ctrls, res_controls] = res_parse;

                //console.log('depth_0_ctrls', depth_0_ctrls);
                console.log('res_controls', res_controls);

                // Go through all named controls.
                //  Set the name of target[a.name] = ctrl;
                each(res_controls.named, (ctrl, name) => {
                    //console.log('name', name);
                    target[name] = ctrl;
                });
                const is_active_context = context.__is_active;

                //console.log('is_active_context', is_active_context);
                //console.log('depth_0_ctrls.length', depth_0_ctrls.length);
                each(depth_0_ctrls, new_ctrl => {
                    //console.log('pre add new_ctrl');

                    // how many children within this control?
                    console.log('');
                    console.log('new_ctrl._id()', new_ctrl._id());
                    console.log('new_ctrl', new_ctrl);

                    // parse does not add content (correctly) to the first level 0.

                    container.add(new_ctrl);
                    // activate it here?
                    //  test to see if it's in an active context?
                    //console.log('is_active_context', is_active_context);
                    // Wait...?
                    //  May be better to integrate auto activation at a lower level.

                    if (is_active_context) {
                        setTimeout(() => {
                            new_ctrl.activate();
                        }, 0);
                    }
                });
                
                //log('res_controls', res_controls);
                //log('Object.keys(res_controls)', Object.keys(res_controls));
                //console.log('Object.keys(res_controls.named)', Object.keys(res_controls.named));

                // Go through the named controls.
                // should have both .named and .unnamed

                // Maybe don't bother with this?
                //  Are they all named?
                //   Or reconstruct it?

                //console.log('!!res_controls.named', !!res_controls.named);

                if (res_controls.named) {
                    target._ctrl_fields = target._ctrl_fields || {};
                    Object.assign(target._ctrl_fields, res_controls.named);
                }

                solve(depth_0_ctrls);

            }
        })



        


    })


    
    

}





// with 4 params - have a target, and a container

const ____old_parse_mount = function(str_content, target, control_set) {

    let container;
    let a = arguments;
    let l = a.length;
    if (l === 4) {
        container = a[2];
        control_set = a[3];
    } else {
        container = target;
    }
    // Add it to the container (may be subcontrol). Mount it to the target.
    // A promise would probably do for the moment.
    //  could use var DOMParser = require('xmldom').DOMParser;

    // May need to make some nice isomorphic code for browser and node.

    console.log('parse_mount str_content', str_content);
    // Unfortunately seems like it will be async when using htmlparser?
    //  Or need a callback?
    //  Make a new parser, find one, use integrated parser somehow?

    // Parse the str_content into a DOM.
    //  parse-mounts into the target

    // Comes up with a spec for each of the items parsed.

    // remove white space first

    str_content = str_content.trim();

    const {context} = target;

    //log('parse_mount str_content', str_content);
    //log('target._id()', target._id());

    // Recursively go through the html-like, creating jsgui controls.
    //  This will enable much more concise expression of jgsui controls.

    //var rawHtml = "Xyz <script language= javascript>var foo = '<<bar>>';< /  script><!--<!-- Waah! -- -->";
    var handler = new htmlparser.DefaultHandler(function (error, dom) {
        if (error) {
            log('parse error', error);
        }
            //[...do something for errors...]
        else {
            log('dom', dom);
            // Then can recurse through the dom object.
            //  Nice that it parses non-standard elements.

            // depth-first recursion for creation of the elements.
            //  Then will add them to the parents as they get created.
            // replace the children with controls?

            // when doing 

            let recurse = (dom, depth, callback) => {
                let tdom = tof(dom);
                let res;
                log('tdom', tdom);
                log('dom item', dom);

                if (tdom === 'array') {
                    //res = [];
                    each(dom, v => {
                        //res.push(recurse)
                        recurse(v, depth + 1, callback);

                        // then later (depth first) callback
                        callback(v, depth);

                    })
                } else if (tdom === 'object') {
                    if (dom.children) {
                        each(dom.children, child => {
                            recurse(child, depth + 1, callback);

                            callback(child, depth);
                        })
                    }
                } else {
                    log('dom', dom);
                }
            }
            // want to create the items as well.
            //  start with innermost, adding the child controls to the outer ones.
            //   need to be able to run controls from these strings which come as templates.
            //   eliminate the need for much of the control construction code, at least make it much more concise.


            /*
            const new_ctrl_made = (ctrl) => {
                // this will need to assemble to controls into a heirachy.
                //  May need to know the depth so to know which to join together.

                // includes text controls
            }
            */

            // handle text
            //  should know what level the text is at
            //   needs to know when the level decreases so we can put the children in the parent.

            let last_depth = 0;

            // maybe need a map of siblings at depth
            //let child_nodes = [];
            // siblings in a list, children in a list?
            //  or only need one list with depth-first?
            // can build it up within the closure.

            // sounds like we need it as we add to the tree at different depths.
            // map of open arrays at different depths?

            // need to push the text node at the depth.

            let map_siblings_at_depth = {};
            // Then when moving up a depth we nullify the array
            //  Then moving down the depth we create a new array.
            //  Do this for controls.
            //  Including text controls.

            let res_controls = {};

            const handle_text = (text, depth) => {

                //child_nodes.push(text);

                // Maybe don't need the text node control here.
                //  When we have the text as a single child, we can declare it as a property.
                //  However, the full text node instantiation makes sense for not taking shortcuts.

                let tn = new control_set.Text_Node({
                    text: text,
                    context: context
                });

                //log('tn', tn);
                //log('text', text);
                //log('tn instanceof Text_Node', tn instanceof control_set.Text_Node);
                //log('tn.text', tn.text);
                //log('tn._text', tn._text);
                //throw 'stop';
                res_controls.unnamed = res_controls.unnamed || [];
                res_controls.unnamed.push(tn);
                // push it into siblings at depth too.
                map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                map_siblings_at_depth[depth].push(tn);

                // doesn't have a name though.
                //  there will be other unnamed controls that should be returned in the results.
                // The names maybe will not be so important.

                last_depth = depth;
            }

            // an array of siblings at levels
            //  then remove? the array when going up a level, use it as the children for a node?

            // need to be able to start up a node while specifying its content?
            //  including the content in the spec could work well.
            //   

            // Get rid of the span rendering shortcut?
            //  Always use the textNode?
            //  Have the .text property a shortcut to modifying that text node?

            // Span .text is really convenient in many cases.
            // Spans can contain other elements so it's worth being careful.

            // The .text shortcut looks like its not carrying out the underlying dom functionality.
            //  Better to have it do the underlying dom tasks properly, and then have sugar around that.

            // So don't have special rendering for the span element.
            // Divs / controls can take text nodes too.

            // Maybe have .text read-only.
            //  .set_text too?
            //  .set_text for convenience in some situations.
            //   In other situations, we use proper text nodes alongside whatever else goes inside a span.

            // the .text set and get property could stay for convienience.
            //  It needs to deal with textNode object underneith though.

            // General route is to handle things in the conventional DOM way on a lower level
            //  Then on a higher level there will be systems of convenience for the programmer.

            // So setting text will replace the content.
            //  Get rid of the specialised span rendering.
            //  Get rid of text property for the moment?
            //   Or have it do its stuff on a lower level.


            const handle_tag = (tag, depth) => {

                console.log('handle_tag tag', tag);

                const tag_with_no_children = {};
                if (tag.raw) tag_with_no_children.raw = tag.raw;
                if (tag.data) tag_with_no_children.data = tag.data;
                if (tag.type) tag_with_no_children.type = tag.type;
                if (tag.name) tag_with_no_children.name = tag.name;
                if (tag.attribs) tag_with_no_children.attribs = tag.attribs;

                // Then the name property - need to use these named controls to set the control's _ctrl_fields

                //log('handle_tag tag_with_no_children', tag_with_no_children);
                // maybe pass through the tag with no children. the children have been made into controls.

                // will add to the collection of siblings.
                // has the depth increased?
                // create control...

                // and the children? content
                const create_ctrl = (tag, content) => {
                    if (control_set[tag.name]) {
                        //log('has jsgui control for ' + tag.name);
    
                        // need to look into if there are child jsgui controls within this.
    
                        let Ctrl = control_set[tag.name];
                        // work out the spec as well.
                        log('tag', tag);
                        let a = tag.attribs || {};

                        // Why isnt content working in the spec?
                        //  Expecially with a Text_Node?
                        if (content) a.content = content;
                        //log('content.length', content.length);

                        each(content, item => {
                            //log('content item', item);
                            //log('Object.keys(content item)', Object.keys(item));
                            //log('(content item.__type_name)', (item.__type_name));
                            //log('(content item._text)', (item._text));
                            //log('(content item.text)', (item.text));
                        })

                        // want an easier way to view the content.
                        //  don't want large printouts of the jsgui controls.



                        log('attribs a', a);
                        log('\n\n');
                        //log('!!target', !!target);
                        //log('!!target.context', !!target.context);
                        a.context = context;
    
                        let ctrl = new Ctrl(a);
                        if (a.name) {
                            res_controls.named = res_controls.named || {};
                            res_controls.named[a.name] = ctrl;

                            // Expected behaviour to replace existing composition code.
                            target[a.name] = ctrl;

                            //res_controls[a.name] = ctrl;
                        } else {
                            res_controls.unnamed = res_controls.unnamed || [];
                            res_controls.unnamed.push(ctrl);
                        }
                        // and unnamed controls
                        //  an array of them...
    
                        // The name property - possibly name could be stored by the control itself.
                        //  Different to its id.
    
                        //log('!!ctrl', !!ctrl);
                        //log('depth', depth);

                        return ctrl;
                    } else {
                        // The app's controls need to be loaded / registered previous to this.
                        //log('lacking jsgui control for ' + tag.name);

                        // The server app should register it?


                        //console.log('tag', tag);
                        console.trace();

                        throw 'lacking jsgui control for ' + tag.name;
                    }
                }

                // create the control at this stage?
                //  having a 'content' or 'children' property could work well here.
                //  setting .content would make sense well.

                let my_children;
                let ctrl;

                if (depth > last_depth) {

                    // Likely will happen.
                    //  The fix I put in got lost before.
                    //  It does not need to do that much where there are no child nodes.

                    

                    ctrl = create_ctrl(tag_with_no_children);
                    //map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    map_siblings_at_depth[depth] = []; // because its a new depth?
                    map_siblings_at_depth[depth].push(ctrl);

                    console.log('depth > last_depth [depth, last_depth]', [depth, last_depth]);
                    console.trace();
                    //throw 'NYI';

                    // Not sure how this will happen as the depth should move outwards?
                    //  Will need to check / measure recursion order.

                    // depth increase.
                    //  means moving to new child.
                    //   this does depth first, but starting from the first.
                    //    not sure that makes sense, need to check that it works.

                    // 
                    map_siblings_at_depth[depth] = [];

                    // but need to add the item.
                    //map_siblings_at_depth[depth].push();

                    //log('child_nodes', child_nodes);

                    //child_nodes = [];


                } else if (depth < last_depth) {

                    //log('child_nodes', child_nodes);
                    // create the control.

                    //child_nodes = [];
                    // my children in array!!!
                    //log('last_depth', last_depth);

                    my_children = map_siblings_at_depth[last_depth];
                    //log('my_children', my_children);

                    //throw 'stop';

                    if (my_children) {
                        //log('my_children.length', my_children.length);
                        ctrl = create_ctrl(tag_with_no_children, my_children);
                    } else {
                        ctrl = create_ctrl(tag_with_no_children);
                    }
                    //log('ctrl.content._arr.length', ctrl.content._arr.length);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];

                    // do we need to keep these child controls now?
                    //  prob best not to.
                    map_siblings_at_depth[last_depth] = null;
                    map_siblings_at_depth[depth].push(ctrl);

                    // create the ctrl including the content.

                    // create the control with the children.
                    //  maybe just say they are 'content'.

                    // being able to choose content subcontrols at declaration seems very important here.


                } else {
                    ctrl = create_ctrl(tag_with_no_children);
                    map_siblings_at_depth[depth] = map_siblings_at_depth[depth] || [];
                    map_siblings_at_depth[depth].push(ctrl);

                    // I think that means that this one doesn't have children either.
                    // same depth - sibling
                    //  create a new control.
                    //   I think this means that the last control in the loop had no subcontrols.
                    // Will need to observe the algo in operation to make sure it works correctly.
                    //child_nodes.push(tag)

                }
                // Create a control out of the tag
                last_depth = depth;
            }

            // goes depth-first.
            recurse(dom, 0, (item, depth) => {
                //log('item', item);
                //log('depth', depth);

                // analyse the item
                //  is it an element (tag)?

                if (item.type === 'text') {
                    // These don't have children
                    //  They are also the inner-most.
                    // create a jsgui text node.
                    //log('text item', item);
                    // trim it

                    let trimmed = item.data.trim();
                    //log('trimmed', trimmed);
                    //log('trimmed.length', trimmed.length);

                    if (trimmed.length > 0) {
                        handle_text(item.raw, depth);
                    }
                    // Need to rapidly 
                } else if (item.type === 'tag') {
                    // does it have children?

                    // if not, create a control from the children.

                    // then if it does, what are its control children?

                    //log('tag item', item);
                    //log('item.children.length', item.children.length);

                    handle_tag(item, depth);

                    /*
                    if (!item.children) {
                        log('no children item', item);
                        throw 'stop';
                    }
                    */

                }
            });
            // Really not that good parse-mount being async.
            //  May need to fix that for it to work.
            //   Composition should be instant, but does not need to return a value.

            // Would be best to separate out the parsing.
            //
            // the parse result is the depth 0 controls.

            const depth_0_ctrls = map_siblings_at_depth[0];


            // then once the recursion is done, see what's at level 0
            //log('');
            //log('map_siblings_at_depth[0]', map_siblings_at_depth[0]);

            //log('map_siblings_at_depth[0].length', map_siblings_at_depth[0].length);

            //log('map_siblings_at_depth', map_siblings_at_depth);
            //throw 'stop';

            // context.__is_active?
            //  
            //const context = target.context;
            const is_active_context = context.__is_active;

            each(depth_0_ctrls, new_ctrl => {
                container.add(new_ctrl);

                // activate it here?
                //  test to see if it's in an active context?

                //console.log('is_active_context', is_active_context);

                // Wait...?
                //  May be better to integrate auto activation at a lower level.

                if (is_active_context) {
                    setTimeout(() => {
                        new_ctrl.activate();
                    }, 0);
                }

            });

            target._ctrl_fields = target._ctrl_fields || {};
            //log('res_controls', res_controls);
            //log('Object.keys(res_controls)', Object.keys(res_controls));
            //console.log('Object.keys(res_controls.named)', Object.keys(res_controls.named));

            // Go through the named controls.
            // should have both .named and .unnamed

            // Maybe don't bother with this?
            //  Are they all named?
            //   Or reconstruct it?

            if (res_controls.named) {
                Object.assign(target._ctrl_fields, res_controls.named);
            }

            //throw 'stop';

            // and a callback?
            // Seems like the async is not a problem - but its not adding the text.

            // Handling async composition may be useful though.



            //throw 'stop';
        }
            //[...parsing done, do something...]
    });
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(str_content);
}
//

const res = {
    parse: parse,
    parse_mount: parse_mount
}

module.exports = res;