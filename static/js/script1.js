//var site_addr = 'http://104.236.111.81:5000';
var site_addr = 'http://neuronaming.net';

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
    var curSelect = 'All';
    /* //var site_addr = 'http://104.236.111.81:5000';
    var site_addr = 'http://neuronaming.net'; */

    $(document).on('click', '#my-dropdown a', function () {
        //curSelect = $(this).data('value');
        curSelect = $(this)[0].id;
        $('[data-target="#my-dropdown"] .text').text($(this).text());
        $("#my-dropdown").dropdown("toggle");
        return false;
    })

    $(document).on('click', '.gen-btn', function () {
        //button "Generate Names" click
        $('#start').addClass('hidden');
        $('#results').addClass('hidden');
        $('#working').removeClass('hidden');
        $.ajax({
            type: 'GET',
            url: site_addr + '/api01/generate_names',
            data: {
                'category': curSelect
            },
            timeout: 20000,
            success: function(data){
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
            },
            error: function(data){
                alert('Error receiving data from server: (' + data.status + ') ' + data.statusText);
            }
        });
	return false;
    })

    $(document).ready(function() {
        //load "Names already generated"
        $.ajax({
            type: 'GET',
            url: site_addr + '/api01/get_names_counter',
            timeout: 20000,
            success: function(data){
                $('#total').html(data['total']);
            },
            error: function(data){
                alert('Error receiving data from server: (' + data.status + ') ' + data.statusText);
            }
        });
    });

})
