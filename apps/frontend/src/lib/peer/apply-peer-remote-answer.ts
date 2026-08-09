interface ApplyPeerRemoteAnswerProps {
	peer: RTCPeerConnection;
	answer: RTCSessionDescriptionInit;
}

export async function applyPeerRemoteAnswer({
	peer,
	answer
}: ApplyPeerRemoteAnswerProps): Promise<void> {
	if (peer && peer.signalingState !== "stable") {
		await peer.setRemoteDescription(new RTCSessionDescription(answer));
	}
}
