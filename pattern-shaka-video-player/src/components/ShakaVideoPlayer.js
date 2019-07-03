import hoc from '@enact/core/hoc';
import VideoPlayer from "@enact/moonstone/VideoPlayer";
import React from 'react';
import PropTypes from 'prop-types';
import shaka from 'shaka-player';

const ShakaPlayerDecorator = hoc((config, Wrapped) => {
	return class extends React.Component {
		static displayName = 'ShakaPlayerDecorator';

		static propTypes = {
			manifestUri: PropTypes.string,
			config: PropTypes.object
		};

		componentDidMount () {
			// Install built-in polyfills to patch browser incompatibilities.
			shaka.polyfill.installAll();

			// Check to see if the browser supports the basic APIs Shaka needs.
			if (shaka.Player.isBrowserSupported()) {
				// Everything looks good!
				this.initPlayer(this.props.manifestUri, this.videoNode);
			} else {
				// This browser does not have the minimum set of APIs we need.
				console.error('Browser not supported!');
			}
		}

		onErrorEvent = (event) => {
			// Extract the shaka.util.Error object from the event.
			this.onError(event.detail);
		}

		onError = (error) => {
			// Log the error.
			console.error('Error code', error.code, 'object', error);
		}

		initPlayer = () => {
			// Create a Player instance.
			const player = new shaka.Player(this.videoNode);

			// Listen for error events.
			player.addEventListener('error', this.onErrorEvent);

			// Try to load a manifest.
			// This is an asynchronous process.
			player
				.load(this.props.manifestUri)
				.then(function() {
					// This runs if the asynchronous load is successful.
					console.log('The video has now been loaded!');
				})
				.catch(this.onError); // onError is executed if the asynchronous load fails.
			// Configuration for the player here https://shaka-player-demo.appspot.com/docs/api/tutorial-config.html
			const playerConfig = {...config, ...this.props.config};
			player.configure(playerConfig);
		}

		setWrappedRef = (node) => {
		if (node && node.getVideoNode) {
			this.videoNode = node.getVideoNode().media;
		}
	}

		render () {
			const props = Object.assign({}, this.props);
			delete props.manifestUri;

			return <Wrapped {...props} ref={this.setWrappedRef} />
		}
	}
});

const ShakaVideoPlayer = ShakaPlayerDecorator(VideoPlayer);

export default ShakaVideoPlayer;