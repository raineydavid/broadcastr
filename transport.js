var google = require('googleapis')

var OAuth2 = google.auth.OAuth2,
    oauth2Client = new OAuth2('861801325411-88uiq1nodmq0a1mqdcp4g3gb4lqeqc1k.apps.googleusercontent.com','AHxHWl5HayoqX7QaUBzOIZ5b',process.env.GOOGLE_OAUTH_CALLBACK),
    gmail = google.gmail('v1'),
		options = {client:oauth2Client};


function GmailTransport( options ) {
	if ( ! ( this instanceof GmailTransport ) ) {
		return new GmailTransport( options );
	}

	this.options = options || {};
	this.name = 'Gmail';
	this.version = '0.0.1';

	this._gmail = google.gmail( { version: 'v1', auth: options.client } )
}

GmailTransport.prototype.send = function( mail, callback ) {
	// Build the message with the BCC header
	mail.message.keepBcc = true;

	if ( this.options.error ) {
		setImmediate( function() {
			callback( new Error( this.error ) );
		}.bind( this ) );
		return;
	}

	var message = mail.message.createReadStream();

	var info = {
		messageId: ( mail.message.getHeader( 'message-id' ) || '' ).replace( /[<>\s]/g, '' ),
		envelope: mail.data.envelope || mail.message.getEnvelope(),
		account: this.options.client.credentials.email
	};

	var send = this.options.draft ? this._gmail.users.drafts.create : this._gmail.users.messages.send;

	send( {
		userId: "me",
		media: {
			mimeType: "message/rfc822",
			body: message
		}
	}, function( err, response ) {
		info.response = response;
		callback( err, info );
	} );
};

module.exports = GmailTransport;
