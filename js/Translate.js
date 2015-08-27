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

	'manage playlist': 'Manage the playlist',

	'end editing': 'End editing',

	'show title': 'Show title',

	'help songs': 'Drop a music file in the page or open the Source Menu (move your mouse on the left).',

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

	'manage playlist': 'Modifier la playlist',

	'end editing': 'Fin de la modification',

	'show title': 'Afficher le titre',

	'help songs': 'Déposez une musique dans cette page ou ouvrez le "Source Menu" (déplacez votre souris sur la gauche).',

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