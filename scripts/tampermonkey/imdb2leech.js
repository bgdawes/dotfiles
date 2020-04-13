// ==UserScript==
// @name           imdb2leech
// @namespace      http://userscripts.org/users/145873
// @description    Add links from IMDB movie pages to torrent sites -- easy downloading from IMDB
//
// Preference window for userscripts:
// @require	   http://jerkface.net/software/45988.user.js
//
// @include        https://*.imdb.com/title/tt*
// @include        https://*.imdb.de/title/tt*
// @include        https://*.imdb.es/title/tt*
// @include        https://*.imdb.fr/title/tt*
// @include        https://*.imdb.it/title/tt*
// @include        https://*.imdb.pt/title/tt*
//
// @grant	GM_getValue
// @grant	GM_registerMenuCommand
// @grant	GM_xmlhttpRequest
// @grant	GM_log
// @grant	GM_setValue
//
// ==/UserScript==


// Default preferences are stored in two places: defaults settings
// for USP (here) and defaults for GM_getValue (below).  Make sure to
// change both if you change one.
try {
  USP.theScriptName = 'imdb2leech';
  USP.init({theName:'pirate_header_text', theText:'Header text:', theDefault:'Search'},
	   {theName:'show_strikeout_links', theText:'Show crossed-out search misses?', theDefault:true},
	   {theName:'debug_imdb2leech', theText:'Enable debugging code?', theDefault:true});
  GM_registerMenuCommand('Preferences for ~'+USP.theScriptName+'~', USP.invoke);
} catch (e) { };

// Default preferences are stored in two places: defaults settings for
// USP (above), and defaults for GM_getValue (below).  Make sure to
// change both if you change one.
var show_strikeout_links = GM_getValue('show_strikeout_links', true);
var pirate_header_text = 'Search' + ': ';
var debug_imdb2leech = GM_getValue('debug_imdb2leech', true);
var retard_cant_middle_click = false;

function add_link_areas()
{
 var action_box = document.getElementsByClassName('subtext')[0];
 if (action_box) {
    var p = document.createElement('p');
    p.setAttribute('id', 'piratebox');
    action_box.appendChild(p);
  }
  var h1_list = document.getElementsByTagName('h1');
  if (h1_list) {
    var p = document.createElement('p');
    p.setAttribute('id', 'pirateheader');
    h1_list[0].parentNode.appendChild(p);
  }
}

function add_link(search_url, link_text, strikeout)
{
  var text = document.createTextNode(link_text);
  var a = document.createElement('a');
  a.setAttribute('href', search_url);

  if (retard_cant_middle_click)
    a.setAttribute('target', '_blank');

  if (strikeout) {
    var s = document.createElement('s');
    s.appendChild(text);
    a.appendChild(s);
  } else {
    a.appendChild(text);
  }

  var piratebox = document.getElementById('piratebox');
  if (piratebox) {
    if (!piratebox.hasChildNodes()) {
      piratebox.appendChild(document.createTextNode(pirate_header_text));
    }
    piratebox.appendChild(a.cloneNode(true));
    piratebox.appendChild(document.createTextNode(' '));
  }
  var pirateheader = document.getElementById('pirateheader');
  if (pirateheader) {
    if (!pirateheader.hasChildNodes()) {
      pirateheader.appendChild(document.createTextNode(pirate_header_text));
    }
    pirateheader.appendChild(a);
    pirateheader.appendChild(document.createTextNode(' '));
  }
}

function maybe_add_link(link_text, search_urls, search_fail_match)
{
  var search_url;

  if (typeof(search_urls) == 'object') {
    search_url = search_urls[0];
    search_urls.shift();
  } else {
    search_url = search_urls;
    search_urls = new Array;
  }

  var google_chrome = /chrome/.test(navigator.userAgent.toLowerCase());
  if (google_chrome) {
    add_link(search_url, link_text, false);
  } else {
    GM_xmlhttpRequest({
      method: 'GET',
      url: search_url,
      onload: function(responseDetails)
      {
	if (String(responseDetails.responseText).match(search_fail_match)) {
	  if (search_urls.length) {
	    maybe_add_link(link_text, search_urls, search_fail_match);
	  } else {
	    if (show_strikeout_links)
	      add_link(search_url, link_text, true);
	  }
	} else {
	  add_link(search_url, link_text, false);
	}

	if (debug_imdb2leech) {
	  GM_log([responseDetails.finalUrl + ' => ' + responseDetails.statusText,
		  "",
		  responseDetails.responseHeaders,
		  responseDetails.responseText
		 ].join("\n"));
	}
      }
    });
  }
}

var match = String(document.URL).match(/\/tt([0-9]*)/);
if (match) {
  var tt = 'tt' + match[1];
  var nott = match[1];

  add_link_areas();

  maybe_add_link('CG', Array('http://cinemageddon.net/browse.php?search=' + tt,
			     'http://cinemageddon.net/browse.php?descr=1&search=t' + nott),
		 /<h2>Nothing found!<\/h2>|<h1>Not logged in!<\/h1>/);
/*  maybe_add_link('TPB', 'https://thepiratebay.org/search/' + tt,
		 /No hits. Try adding an asterisk in you search phrase.<\/h2>/); */
/*  maybe_add_link('D', 'http://www.demonoid.pw/files/?query=' + tt, /<b>No torrents found<\/b>|We are currently performing the daily site maintenance.<br>/); */
  maybe_add_link('KG', 'https://karagarga.in/browse.php?search_type=imdb&search=' + nott,
		 /<h2>Nothing found!<\/h2>|<h1>Not logged in!<\/h1>/);
  maybe_add_link('Tik', 'https://cinematik.net/browse.php?srchdtls=1&incldead=1&search=' + tt,
		 /The page you tried to view can only be used when you're logged in|<h2>Nothing found!<\/h2>/);
/*  maybe_add_link('SM', Array('http://www.surrealmoviez.info/advanced_search.php?simdb=' + tt,
			     'http://www.surrealmoviez.info/search.php?stext=' + tt),
		 /0 Movies found matching search criteria|You need to be logged in to view this page/);
  maybe_add_link('HH', 'http://www.horrorhaven.org/search.php?stype=articles&stext=' + tt,
		 /0 Articles found matching search criteria/);
  maybe_add_link('ILC', 'http://www.iloveclassics.com/browse.php?incldead=1&searchin=2&search=' + tt,
		 /Try again with a refined search string|<h1>Not logged in!<\/h1>/);
  maybe_add_link('AT', 'http://www.asiatorrents.com/torrents.php?active=0&options=1&search=' + tt,
		 /No torrents here\.\.\.<\/TD>/); */
/*  maybe_add_link('NZB',
    'http://nzbmatrix.com/nzb-search.php?cat=0&searchin=weblink&maxage=0&grp=&larger=0&smaller=0&minhits=0&maxhits=0&sort=0&type=asc&search=' + tt,
    /^$|The search found no results, please try again\./); */ // When not logged in, NZB returns an empty page with a "refresh: 0; url=..." HTTP header.

  var title = document.title;
  //var search_string = title.replace(/ +\(.*/, '').replace(/[^a-zA-Z0-9]/g, ' ').replace(/ +/g, '+');
  var search_string = title.replace(/ +\(.*/, '').replace(/ +/g, '+');

  maybe_add_link('1337X', 'https://www.1337x.to/search/' + search_string +/1/, /<h2>Nothing found!<\/h2>|<h1>Not logged in!<\/h1>/);
  maybe_add_link('YTS', 'https://yts.mx/browse-movies/' + search_string, /<h2>Nothing found!<\/h2>|<h1>Not logged in!<\/h1>/);

/*  maybe_add_link('BHQ', 'http://www.bithq.org/browse.php?search=' + search_string, /<h2>Nothing found!<\/h2>|<h1>Not logged in!<\/h1>/); */
/*  maybe_add_link('THC', */
/*    'http://horrorcharnel.org/browse.php?title=1&incldead=1&cat=0&genres=1&codec=5&search=' + search_string, */
/*    /<h1>Not logged in!<\/h1>|Nothing found!/); */
/*  maybe_add_link('PTP',
    'http://www.passthepopcorn.org/torrents.php?action=advanced&tags_type=0&order_by=s3&order_way=desc&torrentname=' + search_string,
    /Have you lost your password\?|<h2>No results were found matching your search criteria\.<\/h2>/);
  maybe_add_link('TrZ', 'http://www.torrentz.com/search?q=' + search_string, /<b>Could not match your exact query<\/b>/);
  maybe_add_link('DVD', 'http://www.dvdspider.co.uk/search.php?search="' + search_string + '"', /<B>None Found<\/B>/); */
/*  maybe_add_link('Avax', 'http://avaxsearch.com/avaxhome_search?a=&exact=1&c=54&l=&sort_by=relevance&commit=Search&q=' + search_string,
    /raquo;, found 0 post\(s\)./); // This doesn't work right for unicode titles.  C.f. http://akas.imdb.com/title/tt0090985/

  // I don't have an account on TehC.  Some guy who doesn't know what "." means in regexes wrote the following:
  maybe_add_link('TehC', 'http://tehconnection.eu/torrents.php?searchstr=' + search_string,
     /You will be banned for 6 hours after your login attempts run out.|<h2>No Search Results, try reducing your search options.<\/h2>/);
  */
}
