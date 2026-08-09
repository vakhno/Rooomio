interface ApplyPeerRemoteCandidateProps {
	peer: RTCPeerConnection;
	candidate: RTCIceCandidate;
}

export async function applyPeerRemoteCandidate({
	peer,
	candidate
}: ApplyPeerRemoteCandidateProps): Promise<void> {
	if (peer) {
		await peer.addIceCandidate(new RTCIceCandidate(candidate));
	}
}
