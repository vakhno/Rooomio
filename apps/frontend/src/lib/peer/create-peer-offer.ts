interface CreatePeerOfferProps {
	peer: RTCPeerConnection;
}

export async function createPeerOffer({
	peer
}: CreatePeerOfferProps): Promise<RTCSessionDescriptionInit> {
	const offer = await peer.createOffer();

	await peer.setLocalDescription(offer);

	return offer;
}
