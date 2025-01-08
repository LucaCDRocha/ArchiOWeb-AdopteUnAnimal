function degToRad(degrees) {
	return (degrees / 180) * Math.PI;
}

function calculateDistance(src, dest) {
	const dlongitude = degToRad(dest.longitude - src.longitude);
	const dlatitude = degToRad(dest.latitude - src.latitude);
	const a =
		Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2) +
		Math.cos(degToRad(src.latitude)) *
			Math.cos(degToRad(dest.latitude)) *
			(Math.sin(dlongitude / 2) * Math.sin(dlongitude / 2));
	const angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return angle * 6371000;
}

export { calculateDistance, calculateDistance };
