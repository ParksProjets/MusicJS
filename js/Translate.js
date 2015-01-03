/*

Translation French/English

© Guillaume Gonnet
License GPLv2

*/


var language = navigator.browserLanguage || navigator.language;



// Namespace
var Translation = {};


if (language.indexOf('fr') > -1)
	Translation.lang = 'fr';
else
	Translation.lang = 'en';



var t = Translation.get = function(name) {
	return Translation[Translation.lang][name] || '';
};




Translation['en'] = {

	'incompatible file': 'Sorry, this file is incompatible',
	
	'cant read file': 'Sorry, impossible to read this file',

	'drop music here': 'Drop your music files here',

	'general options': 'General options',

	'show title': 'Show title',

	'none': 'None',

	'help': 'Help and Infos',

	'shortcuts': 'Shortcuts',

	'space': 'Space',

	'author': 'Author',

	'enabled': 'Enabled',

	'disenabled': 'Disenabled'

};



Translation['fr'] = {

	'incompatible file': 'Désolé, ce fichier est imcompatible',
	
	'cant read file': 'Désolé, impossible de lire ce fichier',

	'drop music here': 'Déposez vos musiques ici',

	'general options': 'Options générales',

	'show title': 'Afficher le titre',

	'none': 'Aucune',

	'help': 'Aide et Infos',

	'shortcuts': 'Raccourcis',

	'space': 'Espace',

	'author': 'Auteur',

	'enabled': 'Activé',

	'disenabled': 'Désactivé'

};





// Replace in HTML
$('.tr').each(function() {
	$(this).text(Translation.get($(this).text()));
});