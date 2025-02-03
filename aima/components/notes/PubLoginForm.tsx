import { createNoteApi } from "@/store/features/noteApi";
import { setSession } from "@/utils/note";
import { useRouter } from "next/router";
import { useState } from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";

interface Props {
  shareId: string;
  getData: Function;
  setGotResponse: Function;
  setAuthRequired: Function;
}

const PubLoginForm = (props: Props) => {
  const router = useRouter();
  const [getAuth] = createNoteApi.useGetAuthMutation();
  const [password, setPassword]: any = useState();

  const submit = () => {
    (async () => {
      try {
        props.setGotResponse(false);

        const result: any = await getAuth({
          shareId: props.shareId,
          password,
        });

        if (result && result.data && result.data.token) {
          props.setAuthRequired(false);

          setSession(result.data.token);
          props.getData();
        } else {
          props.setGotResponse(true);
          props.setAuthRequired(true);
        }
      } catch (error) {
        console.error("Failed to create note:", error);
      }
    })();
    props.setGotResponse(false);
  };

  return (
    <Rodal visible={true}>
      <div className="p-[34px] pt-[40px] bg-white border rounded">
        <p className="py-2 px-5">Please input password to see this note.</p>

        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="mx-5 my-5 border-0 border-b-2 focus:outline-none"
        />
        <button
          onClick={submit}
          className="rounded px-[13px] py-[5px] hover:bg-violet-800 hover:text-white"
        >
          submit
        </button>
      </div>
    </Rodal>
  );
};

export default PubLoginForm;
