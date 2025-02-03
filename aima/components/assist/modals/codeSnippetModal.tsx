import Modal from "@/components/Modal";
import { Button } from "@mantine/core";
import { useMemo } from "react";

interface CodeSnippetModalProps {
  assistKey: string;
  open: boolean;
  onClose: VoidFunction;
}

const CodeSnippetModal = ({
  open,
  onClose,
  assistKey,
}: CodeSnippetModalProps) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // const url = "http://localhost:3000";
  const url = process.env.NEXT_PUBLIC_FRONT_BASE_URL;

  const codeSnippet = useMemo(
    () =>
      `<script>var appId="${assistKey}",url="${url}/apps/assist/widgets";!function(){var e=document,t=window,a=new URLSearchParams(t.location.search),i=a.get("visitorId"),n=a.get("resumeTicket"),d="";i&&(d+="&visitorId="+i),n&&(d+="&resumeTicket="+n),t.addEventListener("beforeunload",function(){return t.sessionStorage.tabId=t.tabId,null}),t.addEventListener("load",function(){return t.sessionStorage.tabId?(t.tabId=t.sessionStorage.tabId,t.sessionStorage.removeItem("tabId")):t.tabId=i||"10000000-1000-4000-8000-100000000000".replace(/[018]/g,e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)),null}),t.addEventListener("message",function(t){if(t.data?.eventName==="launcher"&&(e.getElementById("chat-app-messenger").style.display=t.data?.open?"block":"none"),t.data?.eventName==="image-modal"){var a=e.getElementById("image-modal-container");if(t.data?.open){var i=e.createElement("iframe");i.id="image-modal",i.style.width="100%",i.style.height="100%",i.style.zIndex=2147483003,i.style.position="fixed",i.style.border=0,i.style.top=0,i.style.left=0,i.src=url+"/image-modal",i.onload=()=>{i.contentWindow.postMessage(t.data,"*")},a.appendChild(i)}else a.removeChild(a.lastElementChild)}});var r=function(){var a=e.createElement("div");a.id="chat-app",a.style.position="fixed",a.style.right="20px",a.style.bottom="20px",a.style.zIndex=2147483002;var i=e.createElement("div");i.id="chat-app-launcher",i.style.width="48px",i.style.height="48px",i.style.borderRadius="50%",i.style.position="relative";var n=e.createElement("iframe");n.id="launcher-iframe",n.style.width="48px",n.style.height="48px",n.style.borderRadius="50%",n.style.zIndex=0,n.style.border="0",n.src=url+"/launcher?key="+appId,i.appendChild(n);var r=e.createElement("div");r.id="chat-app-messenger";var s=e.createElement("iframe");s.id="messenger-iframe",s.width="100%",s.height="100%",s.style.border="0",s.src=url+"/"+appId+"?visitorId="+t.tabId+d,r.appendChild(s);var l=e.createElement("div");l.id="image-modal-container";var o=e.createElement("style");o.textContent="@keyframes chat-app-messenger { 0% { opacity: 0; transform: scale(0); } 40% { opacity: 1; } 100% { transform: scale(1); } } #chat-app-messenger { position: fixed; z-index: 2147483002; overflow: hidden; background-color: white; animation: chat-app-messenger 250ms cubic-bezier(0, 1, 1, 1); transform-origin: bottom right; display: none; width: 400px; height: calc(100% - 104px); max-height: 704px; min-height: 250px; right: 20px; bottom: 84px; box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16); border-radius: 16px; user-select: none; }",a.appendChild(r),a.appendChild(i),a.appendChild(o),a.appendChild(l),e.body.appendChild(a)};"complete"===e.readyState?r():t.attachEvent?t.attachEvent("onload",r):t.addEventListener("load",r,!1)}();</script>`,
    [assistKey]
  );

  return (
    <Modal
      isOpen={open}
      onRequestClose={onClose}
      customClassName="bg-white dark:bg-white"
    >
      <div className="flex justify-between items-start">
        <h1 className="font-bold text-xl">Welcome to Support Chat</h1>

        <button className="text-black" onClick={onClose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-2 my-2">
        <p className="font-medium">
          To get started, add the following code into your website head or body.
        </p>
      </div>
      <div className="flex gap-2 items-center h-full">
        <div className="flex items-center pl-2 h-10 w-full text-xs rounded overflow-hidden text-nowrap bg-white-light">
          {codeSnippet}
        </div>
        <Button
          onClick={() => copyToClipboard(codeSnippet)}
          className="bg-black hover:bg-black/50 text-sm h-10"
        >
          Copy to Clipboard
        </Button>
      </div>
    </Modal>
  );
};

export default CodeSnippetModal;
