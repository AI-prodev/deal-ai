import ReactDOMServer from "react-dom/server";
import { Data } from "@measured/puck";

import "@measured/puck/puck.css";

import Card from "./blocks/Card";
import FeatureList from "./blocks/FeatureList";
import Footer from "./blocks/Footer";
import Section from "./blocks/Section";
import VerticalSpace from "./blocks/VerticalSpace";
import Columns from "./blocks/Columns";
import Stats from "./blocks/Stats";
import Header from "./blocks/Header";
import ButtonGroup from "./blocks/ButtonGroup";
import Button from "./blocks/Button";
import Logos from "./blocks/Logos";
import Hero from "./blocks/Hero";
import { FullWidth, Wide, Medium, Small } from "./blocks/Layout";
import Headline from "./blocks/Typography/Headline";
import Subtitle from "./blocks/Typography/Subtitle";
import Text from "./blocks/Text";
import Image from "./blocks/Image";
import Video from "./blocks/Video";
import List from "./blocks/List";
import Menu from "./blocks/Menu";
import EmailForm from "./blocks/Forms/EmailForm";
import Accordion from "./blocks/Accordion";
import GoogleMaps from "./blocks/GoogleMaps";
import URL from "./blocks/URL";

// CSS
import FeatureListStyle from "./blocks/FeatureList/styles.module.css";
import FooterStyle from "./blocks/Footer/styles.module.css";
import CardStyle from "./blocks/Card/styles.module.css";
import ButtonGroupStyle from "./blocks/ButtonGroup/styles.module.css";
import ButtonStyle from "./blocks/Button/styles.module.css";
import SectionStyle from "./blocks/Section/styles.module.css";
import TextStyle from "./blocks/Text/styles.module.css";
import ColumnsStyle from "./blocks/Columns/styles.module.css";
import StatsStyle from "./blocks/Stats/styles.module.css";
import HeaderStyle from "./blocks/Header/styles.module.css";
import TypographyStyle from "./blocks/Typography/styles.module.css";
import HeadlineStyle from "./blocks/Typography/Headline/styles.module.css";
import SubtitleStyle from "./blocks/Typography/Subtitle/styles.module.css";
import LogosStyle from "./blocks/Logos/styles.module.css";
import HeroStyle from "./blocks/Hero/styles.module.css";
import ImageStyle from "./blocks/Image/styles.module.css";
import VideoStyle from "./blocks/Video/styles.module.css";
import LayoutStyle from "./blocks/Layout/styles.module.css";
import MenuStyle from "@/components/puckeditor/blocks/Menu/styles.module.css";
import EmailFormStyles from "./blocks/Forms/EmailForm/styles.module.css";
import AccordionStyles from "./blocks/Accordion/styles.module.css";
import GoogleMapsStyles from "./blocks/GoogleMaps/styles.module.css";
import URLStyle from "./blocks/URL/styles.module.css";

import { componentStyle, puckStyle } from "./style";
import generate from "@/utils/generate";

function getFunnelId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("funnel");
}

export async function getMenuItems() {
  const funnelId = getFunnelId();

  return fetch(`${process.env.NEXT_PUBLIC_BASEURL}/funnels/${funnelId}/menus`)
    .then(response => response.json())
    .then(data =>
      data
        ? data.map((d: any) => ({
            title: d.title,
            path: d.path,
          }))
        : []
    );
}

const generateHTML = async (data: Data) => {
  let css = componentStyle;
  const menuItems = await getMenuItems();
  let menuColor = "";

  // TODO: Optimize this
  const getLayoutItems = (dropzones: any, props: any, variant: string) => {
    const zones = dropzones[props.id + variant];
    const items = zones?.map((item: any) => {
      switch (item.type) {
        case "ButtonGroup":
          return ButtonGroup.render(item.props);
        case "Button":
          return Button.render(item.props);
        case "Card":
          return Card.render(item.props);
        case "FeatureList":
          return FeatureList.render(item.props);
        case "Columns":
          return Columns.render({
            ...item.props,
            columns: item.props?.columns,
            zoneItems: getColumnItems(dropzones, item.props),
          });
        case "FullWidth":
          return FullWidth.render({
            ...item.props,
            items: getLayoutItems(dropzones, item.props, ":FullWidth"),
          });
        case "Wide":
          return Wide.render({
            ...item.props,
            items: getLayoutItems(dropzones, item.props, ":Wide"),
          });
        case "Medium":
          return Medium.render({
            ...item.props,
            items: getLayoutItems(dropzones, item.props, ":Medium"),
          });
        case "Small":
          return Small.render({
            ...item.props,
            items: getLayoutItems(dropzones, item.props, ":Small"),
          });
        case "Footer":
          return Footer.render(item.props);
        case "Header":
          return Header.render(item.props);
        case "Section":
          return Section(item.props);
        case "Text":
          return Text.render(item.props);
        case "VerticalSpace":
          return VerticalSpace.render(item.props);
        case "Headline":
          return Headline.render(item.props);
        case "Subtitle":
          return Subtitle.render(item.props);
        case "Image":
          return Image.render(item.props);
        case "Video":
          return Video.render(item.props);
        case "List":
          return List.render(item.props);
        case "EmailForm":
          return EmailForm.render(item.props);
        case "Accordion":
          return Accordion.render(item.props);
        case "GoogleMaps":
          return GoogleMaps.render(item.props);
        case "URL":
          return URL.render(item.props);
        case "Menu":
          props.color && (menuColor = props.color);

          return Menu.render({
            ...props,
            items: menuItems,
          });
        default:
          return "";
      }
    });

    return items ?? [];
  };
  const getColumnItems = (dropzones: any, props: any) => {
    return props.columns?.map((clm: any, index: number) => {
      const zones = dropzones[props.id + ":Columns-" + index];
      const items = zones?.map((item: any) => {
        switch (item.type) {
          case "ButtonGroup":
            return ButtonGroup.render(item.props);
          case "Button":
            return Button.render(item.props);
          case "Card":
            return Card.render(item.props);
          case "FeatureList":
            return FeatureList.render(item.props);
          case "Footer":
            return Footer.render(item.props);
          case "Header":
            return Header.render(item.props);
          case "Section":
            return Section(item.props);
          case "Columns":
            return Columns.render({
              ...item.props,
              columns: item.props?.columns,
              zoneItems: getColumnItems(dropzones, item.props),
            });
          case "Text":
            return Text.render(item.props);
          case "VerticalSpace":
            return VerticalSpace.render(item.props);
          case "Headline":
            return Headline.render(item.props);
          case "Subtitle":
            return Subtitle.render(item.props);
          case "Image":
            return Image.render(item.props);
          case "Video":
            return Video.render(item.props);
          case "List":
            return List.render(item.props);
          case "EmailForm":
            return EmailForm.render(item.props);
          case "Accordion":
            return Accordion.render(item.props);
          case "GoogleMaps":
            return GoogleMaps.render(item.props);
          case "URL":
            return URL.render(item.props);
          case "Menu":
            props.color && (menuColor = props.color);

            return Menu.render({
              ...props,
              items: menuItems,
            });
          default:
            return "";
        }
      });
      return items;
    });
  };

  const rowhtml: any = data.content.map(({ type, props }: any) => {
    switch (type) {
      case "ButtonGroup":
        return ButtonGroup.render(props);
      case "Button":
        return Button.render(props);
      case "Card":
        return Card.render(props);
      case "Columns":
        return Columns.render({
          ...props,
          zoneItems: getColumnItems(data.zones, props),
        });
      case "FullWidth":
        return FullWidth.render({
          ...props,
          items: getLayoutItems(data.zones, props, ":FullWidth"),
        });
      case "Wide":
        return Wide.render({
          ...props,
          items: getLayoutItems(data.zones, props, ":Wide"),
        });
      case "Medium":
        return Medium.render({
          ...props,
          items: getLayoutItems(data.zones, props, ":Medium"),
        });
      case "Small":
        return Small.render({
          ...props,
          items: getLayoutItems(data.zones, props, ":Small"),
        });
      case "FeatureList":
        return FeatureList.render(props);
      case "Footer":
        return Footer.render(props);
      case "Header":
        return Header.render(props);
      case "Headline":
        return Headline.render(props);
      case "Subtitle":
        return Subtitle.render(props);
      case "Hero":
        return Hero.render(props);
      case "Section":
        return Section(props);
      case "Text":
        return Text.render(props);
      case "Logos":
        return Logos.render(props);
      case "VerticalSpace":
        return VerticalSpace.render(props);
      case "Stats":
        return Stats.render(props);
      case "Image":
        return Image.render(props);
      case "Video":
        return Video.render(props);
      case "List":
        return List.render(props);
      case "Menu":
        props.color && (menuColor = props.color);

        return Menu.render({
          ...props,
          items: menuItems,
        });
      case "EmailForm":
        return EmailForm.render(props);
      case "Accordion":
        return Accordion.render(props);
      case "GoogleMaps":
        return GoogleMaps.render(props);
      case "URL":
        return URL.render(props);
      default:
        return "";
    }
  });

  const styleGroup = [
    ButtonGroupStyle,
    ButtonStyle,
    CardStyle,
    ColumnsStyle,
    FeatureListStyle,
    FooterStyle,
    HeaderStyle,
    TypographyStyle,
    HeadlineStyle,
    SubtitleStyle,
    HeroStyle,
    LogosStyle,
    SectionStyle,
    TextStyle,
    StatsStyle,
    ImageStyle,
    VideoStyle,
    LayoutStyle,
    MenuStyle,
    EmailFormStyles,
    AccordionStyles,
    GoogleMapsStyles,
    URLStyle,
  ];

  styleGroup.map(itemstyle => {
    Object.keys(itemstyle).map((cls: string) => {
      const regex = new RegExp(cls + " ", "g");
      const regex2 = new RegExp(cls + ":", "g");
      const regex3 = new RegExp(cls + "\\)", "g");
      css = css.replace(regex, itemstyle[cls] + " ");
      css = css.replace(regex2, itemstyle[cls] + ":");
      css = css.replace(regex3, itemstyle[cls] + ")");
    });
  });

  const htmlElement = ReactDOMServer.renderToStaticMarkup(rowhtml);

  return generate({
    rowhtml: htmlElement,
    css: css + puckStyle,
    menuProps: { textColor: menuColor },
  });
};

export default generateHTML;
