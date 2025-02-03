import React from "react";
import { useField, useFormikContext } from "formik";
import { Switch } from "@headlessui/react";
import Tippy from "@tippyjs/react";

interface MasterSwitchProps {
  name: string;
  label: string;
  description: string;
}
type ToggleDescriptions = { [key: string]: string };

const toggleDescriptions: ToggleDescriptions = {
  "Vivid Colors and Contrasts":
    "Bold, contrasting colors attract attention and make subjects stand out against their background",
  "Focus on Composition":
    "Use composition techniques like the rule of thirds and leading lines to highlight the image's main elements",
  "Incorporate Movement or Action":
    "Suggest motion in images for greater engagement, using dynamic poses or lines",
  "Clarity and Simplicity":
    "Opt for a clear, simple design with a focused message, avoiding too many elements",
  "Use of Scale and Perspective":
    "Utilize unusual scales or perspectives to create intriguing and memorable images",
  "Emotional Appeal":
    "Choose imagery that evokes emotions like happiness or surprise to connect with viewers",
  "Innovative or Unexpected Elements":
    "Make images stand out with surprising elements or unique visual twists",
  "Use Negative Space":
    "Employ negative space to enhance visual impact and composition balance",
  "Texture and Patterns":
    "Add depth to images with subtle or prominent textures and patterns",
  "Psychological Triggers":
    "Use colors and shapes that evoke specific psychological responses, like excitement or unity",
  "Sensory Appeal":
    "Create images that appeal to multiple senses, suggesting texture, taste, or sound",
  "Color Palette":
    "Warm colors evoke warmth and excitement; cool colors, calm or sadness",
  Lighting:
    "Bright lighting creates cheerfulness; dim lighting, mystery or sadness",
  Composition:
    "Balanced compositions convey stability; asymmetrical ones, tension or excitement",
  "Perspective and Angle":
    "Low angles show power or inspiration; high angles, vulnerability",
  "Facial Expressions and Body Language":
    "Expressions and poses in images express a range of emotions",
  "Textures and Patterns":
    "Rough textures imply hardship; smooth ones, comfort or elegance",
  Symbolism:
    "Symbolic elements add meaning, like doves for peace or stormy seas for turmoil",
  "Contrast and Saturation":
    "High contrast for drama; low contrast for softness. Saturated colors are lively",
  "Context and Setting":
    "The setting influences emotions, from energetic cityscapes to peaceful landscapes",
  "Narrative Elements":
    "Storytelling in images engages viewers emotionally and intellectually",
};

const MasterSwitch: React.FC<MasterSwitchProps> = ({
  name,
  label,
  description,
}) => {
  const { values, setFieldValue } = useFormikContext<any>();
  const [field] = useField(name);

  const toggleMaster = (checked: boolean) => {
    const newSwitches = values[name].map((switchItem: any) => ({
      ...switchItem,
      [Object.keys(switchItem)[0]]: checked,
    }));
    setFieldValue(name, newSwitches);
  };

  return (
    <div className="mt-[-42px] flex  items-center justify-center rounded-lg p-1 px-2 text-center">
      <p className="bg-[#060818] ">{label}</p>

      <div className="bg-[#060818]">
        <Switch
          checked={field.value.every(
            (switchItem: any) => Object.values(switchItem)[0]
          )}
          onChange={toggleMaster}
          className={`${
            field.value.every((switchItem: any) => Object.values(switchItem)[0])
              ? "bg-blue-600"
              : "bg-gray-500"
          } relative ml-2 inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              field.value.every(
                (switchItem: any) => Object.values(switchItem)[0]
              )
                ? "translate-x-6"
                : "translate-x-1"
            } inline-block h-4 w-4 transform items-center rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </div>
  );
};

interface SwitchArrayProps {
  name: string;
  title?: string;
  description?: string;
}

const MaximumImpactToggles: React.FC<SwitchArrayProps> = ({
  name,
  title = "Maximum Scroll-Stopping Power ",
  description = `
  Enabling Maximum Scroll-Stopping Power will fine-tune the model to
  produce the most impactful social advertisement images that stand
  out and may get higher engagement and Click-Through-Rate (CTR). We
  recommend leaving it on, but you can customize each aspect below.
  To quickly return to default, use the master toggle above.`,
}) => {
  const { values, setFieldValue } = useFormikContext<any>();

  const toggleSwitch = (index: number) => {
    const newSwitches = values[name].map((switchItem: any, idx: number) => {
      if (idx === index) {
        const key = Object.keys(switchItem)[0];
        return { [key]: !switchItem[key] };
      }
      return switchItem;
    });
    setFieldValue(name, newSwitches);
  };

  return (
    <div className="rounded-3xl border-2 border-blue-700 p-6">
      <MasterSwitch name={name} label={title} description={title} />
      <div className="mb-5 mt-5 flex items-center justify-center">
        <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
          <div className="py-7 px-6">
            <div className="mb-5 inline-block rounded-full bg-[#3b3f5c] p-3 text-[#f1f2f3]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                id="svg2"
                version="1.1"
                viewBox="0 0 512 512"
              >
                <g id="layer1" transform="translate(0,-540.36218)">
                  <path
                    d="m 170.65808,1049.7159 c 0.64057,-2.2277 18.18006,-66.93491 38.97663,-143.79366 20.7966,-76.85875 38.25167,-141.33807 38.78907,-143.28739 0.53742,-1.94932 0.18733,-3.53542 -0.77792,-3.52467 -0.96528,0.0101 -31.82814,5.37779 -68.58415,11.92678 -36.75602,6.54899 -66.93352,11.78057 -67.06112,11.62574 -0.18024,-0.21871 40.74345,-154.11164 61.06724,-229.64262 l 3.40594,-12.6579 64.42076,0 64.42076,0 -24.10882,72.26871 c -13.25987,39.74779 -23.79348,72.58409 -23.40802,72.96958 0.38546,0.38549 32.76507,-4.6541 71.95467,-11.19906 52.26031,-8.72789 70.97961,-11.18527 70.22505,-9.21878 -1.52635,3.97787 -226.35532,384.19257 -228.58027,386.55857 -1.21173,1.2886 -1.48083,0.5519 -0.73982,-2.0253 z"
                    fill="#f19a0e"
                    id="path3014"
                  />
                </g>
              </svg>
            </div>
            <p className="text-white-dark">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        {values[name].map((switchItem: any, index: number) => {
          const key = Object.keys(switchItem)[0];
          return (
            <div key={key} className="flex items-center justify-between p-1">
              <Tippy content={toggleDescriptions[key] || "No description"}>
                <label>{key}</label>
              </Tippy>
              <Switch
                checked={switchItem[key]}
                onChange={() => toggleSwitch(index)}
                className={`${
                  switchItem[key] ? "bg-blue-600" : "bg-gray-500"
                } relative my-2 inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    switchItem[key] ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaximumImpactToggles;
