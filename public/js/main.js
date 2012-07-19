$(document).ready(function() {
	$('#search_form').submit(function() {

		//$.mobile.loading('show');
		$.ajax({
			type: 'GET',
			url: '/search',
			data: $('#search_form').serialize(),
			success: function(data, status, xhr) {
				var songs = JSON.parse(data);
				$.each(songs, function(i) {
					var song = songs[i];
					$('#search_list').append('<li><a href="#">'+song.artist+' - '+song.song+'</a></li>');
				});
				$('#search_list').listview('refresh');
				//$.mobile.loading('hide');
			}
		});

		return false;
	});
});