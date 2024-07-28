import Image from "next/image";
import { getTime } from "@/lib/utils";

export default function ChatUserCard({ user, isMe }: { user: any, isMe: boolean }) {
  const color = (isMe) ? 'bg-accent' : 'bg-secondary';
  const textColor = (isMe) ? 'text-accent-content' : 'text-secondary-content';
  const joined = getTime(user.joined);
  
  return (
    <div className="flex flex-cols group relative w-max">
      <div className="">
        <div className="avatar online">
          <div className="w-10 rounded-full">
            <Image alt="image" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" width={10} height={10} />
          </div>
        </div>
      </div>
      <div className="col-span-4">
        <div className="px-2 text-sm">
          {user.name}
        </div>
      </div>
      <span className="pointer-events-none absolute -top-8 left-0 w-max rounded bg-gray-300 text-sm font-medium opacity-0 shadow transition-opacity group-hover:opacity-100 z-[1000]">
        <div class="flex items-center h-full w-full">
          <div class="">
            <div class="text-gray-900 font-medium">{user.name}</div>
            <table class="text-xs my-1">
              <tbody>
                <tr>
                  <td class="text-gray-500 font-semibold">Joined</td>
                  <td class="px-1">{joined}</td>
                </tr>
              </tbody>
            </table>
            <div class="my-1">
              <button className="btn btn-primary btn-xs">
                <i className="fa-solid fa-message"></i>
              </button>
            </div>

          </div>
        </div>
      </span>
    </div>
  );
}


