import Image from "next/image";

interface TeamMemberProps {
  name: string;
  role: string;
  experience: number;
  imageUrl: string;
}

export default function TeamMember({
  name,
  role,
  experience,
  imageUrl,
}: TeamMemberProps) {
  return (
    <div className="flex flex-col items-start gap-5">
      <div className="relative w-48 h-48 lg:w-52 lg:h-52">
        <Image
          src={imageUrl}
          alt={`${name} - ${role}`}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="space-y-2 text-[var(--primary-800)]">
        <h3 className=" font-unbounded text-xl lg:text-2xl font-medium uppercase leading-8 max-w-[200px]">
          {name}
        </h3>

        <div className="space-y-1">
          <p className=" text-xs lg:text-sm leading-6">
            {role}
          </p>
          <p className=" text-xs lg:text-sm leading-6">
            Years of Experience: {experience}
          </p>
        </div>
      </div>
    </div>
  );
}
