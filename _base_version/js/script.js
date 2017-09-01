$(function () {
    var clipboard = new Clipboard('h5.name');
	var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
	if(isIOS) {
		$(document).on('click', 'h5.name textarea', function () {
			this.selectionStart=0;
			this.selectionEnd=this.value.length;
			console.log('click!', this.value.length, this.selectionEnd)
		})
	}
	var ws;
	function initWs() {
	    ws = new WebSocket("ws://"+window.location.host+"/ws/");
	    ws.onopen = function() {
		setInterval(function() {ws.send('refresh');}, 15000);
	    }
	    // Set event handlers.
	    ws.onmessage = function(e) {
	        // e.data contains received string.
	        var data = JSON.parse(e.data);
		if(data.names) {
        		$('#working').addClass('hidden');
	        	$('#results').removeClass('hidden');
	        	var divs = [],
		            nameWrapper = '<h5 id="name$" class="name" data-clipboard-target="#name$"></h5>';
        		divs.push($('<div class="col col-2 namebox"><p class="muted">Click on a name to copy</p></div>'));
		        $.each(data.names, function (i, n) {
        		    divs.push($(nameWrapper.replace(new RegExp('\\$', 'g'), i+1)).html(isIOS ? '<textarea readonly>'+n+'</textarea>' : n))
	        	})
	        	divs.push($('<div class="col col-2 namebox"><a href="#" class="button primary gen-btn" role="button">Generate New &rarr;</a>'));
		        $('#results').empty();
        		var row = $('<div class="row centered"></div>');
		        for(var i = 0; i < divs.length; i++ ) {
        		    row.append(divs[i]);
	        	    if(i % 4 == 3) {
        	        	$('#results').append(row).append('<div class="spacer sm"></div>');
	                	row = $('<div class="row centered"></div>');
		            }
        		}
		        if(i % 4 != 0) {
        		    $('#results').append(row);
	        	}
	        	$('#results h5.name').wrap('<div class="col col-2 namebox"></div>')
			if(isIOS) {
				$('h5.name textarea').each(function() {
					$(this).css('height', 1);
					$(this).css('height', $(this).css('height', this.scrollHeight))
				})
			}
		}
		if(typeof data.total != 'undefined') {
			$('#total').text(data.total)
		}
		if(typeof data.cats != 'undefined') {
			$('#my-dropdown ul').html('');
                        $.each(data.cats, function () {
				$('#my-dropdown ul').append($('<li></li>').append($('<a></a>').attr('href', 'javascript:;').data('value', this.value).html(this.title)));
			})
                }
	    };
	}
	initWs();
    var curSelect = 'All';
    
    $(document).on('click', '#my-dropdown a', function () {
        curSelect = $(this).data('value');
        $('[data-target="#my-dropdown"] .text').text($(this).text());
        $("#my-dropdown").dropdown("toggle");
        return false;
    })

    $(document).on('click', '.gen-btn', function () {
        $('#start').addClass('hidden');
        $('#results').addClass('hidden');
        $('#working').removeClass('hidden');
	if(!ws || ws.readyState === ws.CLOSED) {
		initWs();
		setTimeout(function () {ws.send(curSelect);}, 500);
	} else {
		ws.send(curSelect);
	}
	return false;
    })

})
