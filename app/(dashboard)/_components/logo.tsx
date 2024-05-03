import Image from "next/image";

export const Logo = () => {
	return (
		<div className="flex items-center justify-start gap-3 ml-1">
			<Image height={30} width={30} alt="logo" src="/logo.svg" />
			<span className="text-xl font-bold text-[#0369a1]">Coursify</span>
		</div>
	);
};
