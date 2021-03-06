// http://oomushi.github.io/jquery.multiUpload.js
/**
 * Multiple file upload element (jQuery version)
 
 *  with thanks to:
 *   Stickman -- http://the-stickman.com
 *   Luis Torrefranca -- http://www.law.pitt.edu
 *   Shawn Parker & John Pennypacker -- http://www.fuzzycoconut.com
 *   ...for Safari fixes in the original version
 *
 * Licence:
 *  You may use this script as you wish without limitation, however I would
 *  appreciate it if you left at least the credit and site link above in
 *  place. I accept no liability for any problems or damage encountered
 *  as a result of using this script.
 *
 * Requires:
 *  jQuery 1.8.3 [ http://jquery.com ]
 *
 * Optional parameters:
 *  There are four optional parameters (null = ignore this parameter):
 *
 *  - maximum number of files (default = 0)
 *    An integer to limit the number of files that can be uploaded using the
 *    element. A value of zero means 'no limit'.
 *
 *  - File name suffix template (default '_{id}'
 *    By default, the script will take the name of the original file input
 *    element and append an underscore followed by a number to it, eg. if the
 *    input's name is 'file' then the elements will be numbered sequentially:
 *    file_0, file_1, file_2...
 *    You can change the format of the suffix by passing in a template. This
 *    can be any string, but the sequence '{id}' will be replaced by the
 *    sequential ID of the element. So if the element is called 'file' and you
 *    pass in the template '[{id}]' then the elements will be named file[0],
 *    file[1], file[2]...
 *    To remove the suffix entirely, simply pass an empty string.
 *
 *  - Remove file path (default = false)
 *    By default, the entire path of the file is shown in the list of files.
 *    If you would prefer to show only the file name, set this option to
 *    'true'.
 *
 *  - Remove empty file input element (default = false)
 *    Because an extra (empty) element is created every time a file is
 *    chosen, this means that there will always be one empty file input
 *    element when the form is submitted. By default this is submitted with
 *    the form (exactly as it would be with a 'normal' file input element, in
 *    most browsers) but setting this option to 'true' will cause the element
 *    to be disabled  (and therefore ignored) when the form is submitted.
 *
 * Other notes
 *  Because it's not possible to  set the value of a file input element
 *  dynamically (for good security reasons), this script works by hiding the
 *  file input element when a file is selected, then immediately replacing
 *  it with a new, empty one. This happens so quickly that it looks as if
 *  there's only ever one file input element.
 *  Although ideally the extra elements would be hidden using the CSS setting
 *  'display:none', this causes Safari to ignore the element completely when
 *  the form is submitted. So instead, elements are moved to a position
 *  off-screen.
 *  And no, it's not 'Ajax' -- it doesn't upload the files in the background
 *  or anything clever like that. Its sole purpose is cosmetic: to remove the
 *  need for multiple file input elements in a form.
 */
(function($) {
  $.fn.multiUpload = function(customOptions) {

    var options = {
      max: 0,                                     // Max number of elements (default = 0 = unlimited)
      show_filename_only: false,                  // Whether to strip path info from file name when displaying in list (default = false)
      remove_empty_element: true,                 // Whether or not to remove the (empty) 'extra' element when the form is submitted (default = true)
      container_tag: 'div',                       // Root container tag (default: div)
      list_tag: 'ul',                             // Elements container tag (default: ul)
      element_tag: 'li',                          // Element tag (default: li)
      container_class: 'mfu_container',           // Root container class (default: mfu_container)
      list_class: 'mfu_list',                     // Elements container class (default: mfu_list)
      element_class: 'mfu_element',               // Element class (default: mfu_element)
      remove_label: 'remove',                     // Action remove label (default: remove)
      remove_class: 'mfu_remove',                 // Action remove class (default: mfu_remove)
      max_overflow: function(){                   // Max number of elements overflow event
        alert( 'You may not upload more than ' + options.max + ' files'  );
      },
      remove_confirm: function(element){          // Remove element confirm
        return confirm( 'Are you sure you want to remove the item\r\n' +  element.parent().children('.mfu_name').text() + '\r\nfrom the upload queue?' );
      },
      remove: function(el,src){},                 // Remove element event
      add: function(el,src){},                    // Add element event
      name_gen: function(el){                       // New name generator
        return '[]';
      },
      id_gen: function(el){
        return el.attr("id")+'_'+(el.closest().children('.'+options.list_class).length+1);
      }
    };

    $.extend(options, customOptions);
    
    return this.each(function(index) {
      if( !( $(this).attr('type')== 'file' && $(this).prop("tagName")== 'INPUT' ) ) return;
      
      var $original = $(this);                           // Original input file
      var $container = $('<'+options.container_tag+'>')  // New struct container
                          .addClass(options.container_class);
      var $list = $('<'+options.list_tag+'>')            // New inputs file list
                    .addClass(options.list_class);
      var name = $(this).attr('name');                  // Base name for input elements
      
      function init(element, change) {
        if(change) element.change(function(){
          if( options.max > 0 && $list.children().length > options.max ) options.max_overflow();
          var name = $(this).val(); // Create new row in files list
          if( options.show_filename_only ){ // Extract file name?
            if( name.indexOf( '\\' )>=0 ){
              name = name.substring( name.lastIndexOf( '\\' ) + 1 );
            }
            if( name.indexOf( '//' )>=0 ){
              name = name.substring( name.lastIndexOf( '//' ) + 1 );
            }
          }
          var $name = $('<span>').addClass("mfu_name")
                                 .text(name);
          var $line = $('<'+options.element_tag+'>').addClass(options.element_class);
          var $rm= $('<span>').text("\u2009")
             .attr('title',options.remove_label)
             .addClass(options.remove_class)
             .click(function(){
                var $line = $(this).closest(options.element_tag);
                var $element = $line.find(':input[type="file"]').first();
                options.remove($(this),$element);
                if( options.remove_confirm($element) ){
                  $element.closest('.mfu_container')
                          .children(':input[type="file"]')
                          .removeAttr('disabled');
                  $line.remove();
                }
             });
          $line.append($name);
          $line.append($(this));
          $line.append($rm);
          $list.append($line);
          var $new = $(this).clone(true).val('');
          init($new);
          if(options.max == $list.children().length) $new.attr('disabled','disabled');
          $(this).css({
            position: 'absolute',
            left: '-1000px',
            display: 'none'
          });
          $list.before($new); // Add new element to page
          // Set the name
          $(this).attr('name',options.name_gen($(this)));
          $(this).attr('id',options.id_gen($(this)));
          options.add($line,$(this));
        });
      }
      
      init($original,true);
      
      $original.after($container);
      $container.append($original);
      $container.append($list);

      if( options.remove_empty_element){  // Causes the 'extra' (empty) element not to be submitted
        $original.closest('form').submit(function(){
          $(this).find(':input').last().attr('disabled','disabled');
        });
      }
    });
  };
})(jQuery);
