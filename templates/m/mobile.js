var pass = undefined;
var pwddata = undefined;
var pwddata_keys = undefined;

$(document).bind("mobileinit", function(){
  
  $.mobile.nonHistorySelectors = "secret";
});

$(function(){
  $.getJSON('/api/isLoggedIn', function(data) {
    if(data.isLoggedIn == false) {
      if(typeof(data.loginURL) != 'undefined' && data.loginURL != '') {
        window.location.href = data.loginURLGoogle;
      }
    }
  });
  
  $('#loginbtn').bind('tap', function() {
    pass = $('#password').val();
    loadentries();
  });
  
  $('[data-role="page"]:not(#login)').bind('pageshow', function(event, ui){
    if(pass == undefined) {
      window.location.href="/m/";
      return false;
    }
  });
  
  $('#lock').bind('tap', function(){
    pass = undefined;
    $('#password').val('');
    $('#keyslist').empty();
    $('#catslist').empty();
    $('[class^="data_"]').text('');
  })
});

function loadentries() {
  $.getJSON('/api/getKeys', function(data) {
    if(data.status == true) {
      try {
        pwddata = {};
        pwddata_keys = [];
        $.each(data.passwords, function(index, value) {
          var category = '__empty__';
          if(value.category != '') {
            category = Crypto.AES.decrypt(value.category, pass);
          }

          if(typeof(pwddata[category]) == 'undefined') {
            pwddata[category] = [];
            pwddata_keys.push(category);
          }

          var enccat = '';
          if(value.category != '') {
            enccat = Crypto.AES.decrypt(value.category, pass);
          }

          pwddata[category].push({
              key: value.key
            , category: enccat.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , title: Crypto.AES.decrypt(value.title, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , username: Crypto.AES.decrypt(value.username, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , password: Crypto.AES.decrypt(value.password, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , url: Crypto.AES.decrypt(value.url, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
            , note: Crypto.AES.decrypt(value.note, pass).replace(/</g, "&lt;").replace(/>/g, "&gt;")
          });
        });
        
        $('#catslist').empty();
        $.each(pwddata_keys.sort(sortCategoryList), function(i, val){
          var cat = $('<li></li>');
          var link = $('<a href="javascript:void(0);"></a>');
          link.attr('cat', pwddata_keys[i]);
          link.append(pwddata_keys[i]);
          cat.append(link);
          link.bind('tap', loadkeys);
          $('#catslist').append(cat);
        });
        $('#catslist').listview('refresh');
        
      } catch(ex) {
        $.mobile.changePage($('#wrongpwd'), {
          'role' : 'dialog',
          'changeHash' : false
        });
        $('#password').val('');
        //window.location.href="/m/";
      }
    }
  });
}

function loadkeys() {
  var cat = $(this).attr('cat');
  $('#keyslist').empty();
  $.each(pwddata[cat].sort(sortCategory), function(i, val){
    var entry = $('<li></li>');
    var link = $('<a href="javascript:void(0);"></a>');
    link.attr('cat', cat);
    link.attr('key', val.key);
    link.append(val.title);
    entry.append(link);
    link.bind('tap', loaddetails);
    $('#keyslist').append(entry);
  });
  $.mobile.changePage($('#keyindex'));
  $('#keyslist').listview('refresh');
}

function loaddetails() {
  var cat = $(this).attr('cat');
  var key = $(this).attr('key');
  $.each(pwddata[cat].sort(sortCategory), function(i, val){
    if(val.key != key) { return; }
    
    $('.data_user').text(val.username);
    $('.data_pass').text(val.password);
    $('.data_url').text(val.url);
    $('.data_note').text(val.note);
    $('.data_title').text(val.title);
    $.mobile.changePage($('#passwordview'));
    return;
  });
}

function sortCategoryList(a, b) {
  if(a == b) {
    return 0;
  } else if(a < b) {
    return -1;
  }
  return 1;
}

function sortCategory(a, b) {
  if(a.title == b.title) {
    return 0;
  } else if(a.title < b.title) {
    return -1;
  }
  return 1;
}