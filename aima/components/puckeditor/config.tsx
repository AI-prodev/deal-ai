import VerticalSpace, { VerticalSpaceProps } from "./blocks/VerticalSpace";
import Columns, { ColumnsProps } from "./blocks/Columns";
import ButtonGroup, { ButtonGroupProps } from "./blocks/ButtonGroup";
import Button from "./blocks/Button";
import Card, { CardProps } from "./blocks/Card";
import FeatureList, { FeatureListProps } from "./blocks/FeatureList";
import Footer, { FooterProps } from "./blocks/Footer";
import Header, { HeaderFontProps } from "./blocks/Header";
import Hero, { HeroProps } from "./blocks/Hero";
import Logos, { LogosProps } from "./blocks/Logos";
import Stats, { StatsProps } from "./blocks/Stats";
import { FullWidth, Wide, Medium, Small } from "./blocks/Layout";
import Headline, { HeadlineFontProps } from "./blocks/Typography/Headline";
import Subtitle, { SubtitleFontProps } from "./blocks/Typography/Subtitle";
import Text, { TextFontProps } from "./blocks/Text";
import EmailForm, { EmailFormProps } from "./blocks/Forms/EmailForm";
import Accordion, { AccordionProps } from "./blocks/Accordion";
import Image, { ImageProps } from "./blocks/Image";
import Video, { VideoProps } from "./blocks/Video";
import List, { ListProps } from "./blocks/List";
import Menu, { MenuProps } from "./blocks/Menu";
import GoogleMaps, { GoogleMapsProps } from "./blocks/GoogleMaps";
import URL, { URLFieldsProps } from "./blocks/URL";

import Root, { RootProps } from "./root";
import { Config, Data } from "@measured/puck";
import { LayoutFieldsProps } from "@/components/puckeditor/blocks/Layout/constants";
import { ButtonProps } from "@/components/puckeditor/blocks/Button/constants";

export type { RootProps } from "./root";

export const initialData: Data = {
  content: [],
  root: {},
};

export const viewports: any = [
  {
    width: 500,
    height: "auto",
    icon: "Smartphone",
    label: "Small",
  },
  {
    width: 768,
    height: "auto",
    icon: "Tablet",
    label: "Medium",
  },
  {
    width: 1280,
    height: "auto",
    icon: "Monitor",
    label: "Large",
  },
];

export type Props = {
  ButtonGroup: ButtonGroupProps;
  Button: ButtonProps & { href: string };
  Card: CardProps;
  Columns: ColumnsProps;
  FullWidth: LayoutFieldsProps;
  Wide: LayoutFieldsProps;
  Medium: LayoutFieldsProps;
  Small: LayoutFieldsProps;
  Headline: HeadlineFontProps;
  Subtitle: SubtitleFontProps;
  FeatureList: FeatureListProps;
  Footer: FooterProps;
  Header: HeaderFontProps;
  Hero: HeroProps;
  Logos: LogosProps;
  Stats: StatsProps;
  Text: TextFontProps;
  VerticalSpace: VerticalSpaceProps;
  Image: ImageProps;
  Video: VideoProps;
  List: ListProps;
  Menu: MenuProps;
  EmailForm: EmailFormProps;
  Accordion: AccordionProps;
  GoogleMaps: GoogleMapsProps;
  URL: URLFieldsProps;
};

export type UserConfig = Config<
  Props,
  RootProps,
  "menu" | "empty_sections" | "elements" | "pre_made_sections"
>;

const conf: UserConfig = {
  root: {
    render: Root,
  },
  categories: {
    menu: {
      components: ["Menu"],
    },
    empty_sections: {
      title: "Empty Sections",
      components: [
        "FullWidth",
        "Wide",
        "Medium",
        "Small",
        "Columns",
        "VerticalSpace",
      ],
    },
    elements: {
      title: "Elements",
      components: [
        "Headline",
        "Subtitle",
        "Text",
        "URL",
        "EmailForm",
        "Button",
        "ButtonGroup",
        "Stats",
        "Image",
        "Video",
        "GoogleMaps",
        "Accordion",
        "List",
      ],
    },
    pre_made_sections: {
      title: "Pre-made Sections",
      components: ["Card", "FeatureList", "Footer", "Header", "Hero", "Logos"],
    },
  },
  components: {
    ButtonGroup,
    Button,
    Card,
    Columns,
    FullWidth,
    Wide,
    Medium,
    Small,
    FeatureList,
    Footer,
    Header,
    Headline,
    Subtitle,
    Hero,
    Logos,
    Stats,
    Text,
    VerticalSpace,
    Image,
    Video,
    List,
    Menu,
    EmailForm,
    Accordion,
    GoogleMaps,
    URL,
  },
};

export default conf;
