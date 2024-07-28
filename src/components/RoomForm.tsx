import { useRouter } from "next/router";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNotification } from "@/lib/contexts/notification";

export default function RoomForm({ socket }: { socket: any }) {
  const router = useRouter();
  const { toast } = useNotification();
  
  const [s, setS] = useState<any>(socket);
  const { handleSubmit, control, reset, register } = useForm<any>({
    defaultValues: {
      name: "",
      privacy: false,
      prompt: ""
    },
  });

  const onSubmit = useCallback(async (data: any) => {
    try {
      if (!s.current) {
        console.log("No current socket!");
      }
      
      s.current.emit("new-room", data);
    } catch (err) {
      console.log("Login error:", err);
      toast("error", JSON.stringify(err));
    }
  }, [s, toast]);

  return (
    <form
      className="flex items-center justify-center w-full"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="card w-96 border-accent border shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Create Room</h2>
          
          <input
            className="input input-bordered border-accent w-full max-w-xs my-2"
            type="text"
            placeholder="Room Name"
            {...register('name')}
          />
          
          <label>Campaign ides/requirements</label>
          <textarea  {...register('prompt')} ppaceholder="Optional" />
              
          <label>Make Invite only?</label>
          <select
            {...register("privacy")}
          >
            <option value="false">Public</option>
            <option value="true">Private</option>
          </select>
              
          <div className="card-actions items-center justify-between">
            <button
              className={`btn btn-primary`}
              type="submit"
            >
              Go Adventuring
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}






