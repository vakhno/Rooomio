interface CreatePeerAnswerProps {
	peer: RTCPeerConnection;
	offer: RTCSessionDescriptionInit;
}

export async function createPeerAnswer({
	peer,
	offer
}: CreatePeerAnswerProps): Promise<RTCSessionDescriptionInit> {
	await peer.setRemoteDescription(new RTCSessionDescription(offer));

	const answer = await peer.createAnswer();

	await peer.setLocalDescription(answer);

	return answer;
}
