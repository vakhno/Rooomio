interface CreatePeerParams {
	stream: MediaStream;
	handleOnTrack: (event: RTCTrackEvent, peer: RTCPeerConnection) => void;
	handleOnIceCandidate: (event: RTCPeerConnectionIceEvent) => void;
}

export function createPeer({
	stream,
	handleOnTrack,
	handleOnIceCandidate
}: CreatePeerParams): RTCPeerConnection {
	const peer = new RTCPeerConnection({
		iceServers: [
			{ urls: "stun:stun.l.google.com:19302" },
			{ urls: "stun:stun1.l.google.com:19302" },
			{ urls: "stun:stun2.l.google.com:19302" }
		]
	});

	stream.getTracks().forEach(track => peer.addTrack(track, stream));

	peer.ontrack = (event) => {
		handleOnTrack(event, peer);
	};

	peer.onicecandidate = (event) => {
		handleOnIceCandidate(event);
	};

	return peer;
}
