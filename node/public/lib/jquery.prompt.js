//
// Prompt
// A Non-blocking popup!
// @author Andrew Dodson
// @since Jan 2012
//
;(function($){

	$.fn.prompt = function(title, defaultValue, buttons, callback) {

		// cancel if open already, return an empty jQuery object
		if($('.jquery_prompt').length) {
			return $();
		}

		// build popup
		var $popup = $(
			'<iframe class="jquery_prompt" allowtransparency=true frameborder="0" scrolling="auto" marginheight="0" marginwidth="0">'
		+	'</iframe>'
		+ '<div class="jquery_prompt plugin">'
		+ 	'<div class="form">'
		+			'<p>'+title+'</p>'
		+			'<div class="footer">'
		+				'<input autocomplete="off" type="text" name="text" value="' + defaultValue + '" />'
		+ 			buttons.map(function (button, i) { return '<button name="'+button.name+'" value="'+i+'">'+button.text+'</button>'; }).join(" ")
		+			'</div>'
		+		'</div>'
		+	'</div>'
		);

		// add `ESC` + `enter` listener
		var bind = function(e) {
			if (e.which === 27) { // ESC
				$popup.find('button[name='+buttons[0].name+']').click();
			}
			else if (e.which === 13) { // ENTER
				$popup.find('button[name='+buttons[buttons.length-1].name+']').click();
			}
		};

		$(document).bind('keydown', bind);

		$popup.prependTo("body");

		buttons.forEach(function (button, i) {
			$popup.find('button[name='+button.name+']').click(function() {
				var text = $popup.find('input[name=text]').val();
				$(document).unbind('keydown', bind);
				$popup.remove();
				callback({
					button: button,
					text: text
				});
			});
		});

		$popup.show();

		$popup.find('input[name=text]').select();
	};

})(jQuery);
