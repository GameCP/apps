(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/bridge.js
  var bridge_exports = {};
  __export(bridge_exports, {
    DiscordIcon: () => DiscordIcon,
    SettingsPage: () => SettingsPage,
    deleteWebhook: () => deleteWebhook,
    getWebhooks: () => getWebhooks,
    handleCrash: () => handleCrash,
    handleStart: () => handleStart,
    handleStop: () => handleStop,
    saveWebhook: () => saveWebhook,
    testWebhook: () => testWebhook
  });

  // src/index.jsx
  var import_react3 = __toESM(__require("react"), 1);

  // node_modules/react-icons/lib/iconBase.mjs
  var import_react2 = __toESM(__require("react"), 1);

  // node_modules/react-icons/lib/iconContext.mjs
  var import_react = __toESM(__require("react"), 1);
  var DefaultContext = {
    color: void 0,
    size: void 0,
    className: void 0,
    style: void 0,
    attr: void 0
  };
  var IconContext = import_react.default.createContext && /* @__PURE__ */ import_react.default.createContext(DefaultContext);

  // node_modules/react-icons/lib/iconBase.mjs
  var _excluded = ["attr", "size", "title"];
  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
      }
    }
    return target;
  }
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function Tree2Element(tree) {
    return tree && tree.map((node, i) => /* @__PURE__ */ import_react2.default.createElement(node.tag, _objectSpread({
      key: i
    }, node.attr), Tree2Element(node.child)));
  }
  function GenIcon(data) {
    return (props) => /* @__PURE__ */ import_react2.default.createElement(IconBase, _extends({
      attr: _objectSpread({}, data.attr)
    }, props), Tree2Element(data.child));
  }
  function IconBase(props) {
    var elem = (conf) => {
      var {
        attr,
        size,
        title
      } = props, svgProps = _objectWithoutProperties(props, _excluded);
      var computedSize = size || conf.size || "1em";
      var className;
      if (conf.className) className = conf.className;
      if (props.className) className = (className ? className + " " : "") + props.className;
      return /* @__PURE__ */ import_react2.default.createElement("svg", _extends({
        stroke: "currentColor",
        fill: "currentColor",
        strokeWidth: "0"
      }, conf.attr, attr, svgProps, {
        className,
        style: _objectSpread(_objectSpread({
          color: props.color || conf.color
        }, conf.style), props.style),
        height: computedSize,
        width: computedSize,
        xmlns: "http://www.w3.org/2000/svg"
      }), title && /* @__PURE__ */ import_react2.default.createElement("title", null, title), props.children);
    };
    return IconContext !== void 0 ? /* @__PURE__ */ import_react2.default.createElement(IconContext.Consumer, null, (conf) => elem(conf)) : elem(DefaultContext);
  }

  // node_modules/react-icons/tb/index.mjs
  function TbBrandDiscord(props) {
    return GenIcon({ "tag": "svg", "attr": { "viewBox": "0 0 24 24", "fill": "none", "stroke": "currentColor", "strokeWidth": "2", "strokeLinecap": "round", "strokeLinejoin": "round" }, "child": [{ "tag": "path", "attr": { "d": "M8 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" }, "child": [] }, { "tag": "path", "attr": { "d": "M14 12a1 1 0 1 0 2 0a1 1 0 0 0 -2 0" }, "child": [] }, { "tag": "path", "attr": { "d": "M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833 -1.667 3.5 -3c.667 -1.667 .5 -5.833 -1.5 -11.5c-1.457 -1.015 -3 -1.34 -4.5 -1.5l-.972 1.923a11.913 11.913 0 0 0 -4.053 0l-.975 -1.923c-1.5 .16 -3.043 .485 -4.5 1.5c-2 5.667 -2.167 9.833 -1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2 -2 2 -3" }, "child": [] }, { "tag": "path", "attr": { "d": "M7 16.5c3.5 1 6.5 1 10 0" }, "child": [] }] })(props);
  }

  // src/index.jsx
  function DiscordIcon({ serverId }) {
    const { Link } = window.GameCP_SDK;
    return /* @__PURE__ */ import_react3.default.createElement(
      Link,
      {
        href: `/game-servers/${serverId}/extensions/discord`,
        className: "group flex items-center px-3 py-2 text-sm font-medium rounded-md text-foreground hover:bg-muted hover:text-foreground transition-all duration-150 ease-in-out",
        title: "Discord Notifications"
      },
      /* @__PURE__ */ import_react3.default.createElement(TbBrandDiscord, { className: "mr-3 h-5 w-5 transition-all duration-150 ease-in-out" }),
      /* @__PURE__ */ import_react3.default.createElement("span", null, "Discord")
    );
  }
  function SettingsPage({ serverId }) {
    const [webhookUrl, setWebhookUrl] = (0, import_react3.useState)("");
    const [webhooks, setWebhooks] = (0, import_react3.useState)([]);
    const [loading, setLoading] = (0, import_react3.useState)(false);
    const [message, setMessage] = (0, import_react3.useState)("");
    const [error, setError] = (0, import_react3.useState)(null);
    (0, import_react3.useEffect)(() => {
      loadWebhooks();
    }, [serverId]);
    const loadWebhooks = async () => {
      try {
        const response = await window.GameCP_API.fetch(`/api/x/discord-notifications/webhooks?serverId=${serverId}`);
        const data = await response.json();
        setWebhooks(data.webhooks || []);
      } catch (error2) {
        console.error("Failed to load webhooks:", error2);
      }
    };
    const handleSave = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
      setError(null);
      try {
        const response = await window.GameCP_API.fetch("/api/x/discord-notifications/webhooks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverId, webhookUrl })
        });
        if (response.ok) {
          setMessage("Webhook saved successfully!");
          setWebhookUrl("");
          loadWebhooks();
        } else {
          const data = await response.json();
          setError(data.error || "Failed to save webhook");
        }
      } catch (error2) {
        setError(error2.message);
      } finally {
        setLoading(false);
      }
    };
    const handleDelete = async (url) => {
      const confirmed = await window.GameCP_SDK.confirm({
        title: "Remove Webhook",
        message: "Are you sure you want to remove this Discord webhook? You will stop receiving notifications in this channel.",
        confirmText: "Remove",
        confirmButtonColor: "red"
      });
      if (!confirmed) return;
      setLoading(true);
      setMessage("");
      try {
        const response = await window.GameCP_API.fetch("/api/x/discord-notifications/webhooks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverId, webhookUrl: url })
        });
        if (response.ok) {
          setMessage("Webhook removed successfully");
          loadWebhooks();
        } else {
          const data = await response.json();
          setError(data.error || "Failed to remove webhook");
        }
      } catch (error2) {
        setError(error2.message);
      } finally {
        setLoading(false);
      }
    };
    const handleTest = async () => {
      setLoading(true);
      setMessage("");
      setError(null);
      try {
        const response = await window.GameCP_API.fetch("/api/x/discord-notifications/test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serverId })
        });
        if (response.ok) {
          setMessage("Test message sent to Discord!");
        } else {
          const data = await response.json();
          setError(data.error || "Failed to send test message");
        }
      } catch (error2) {
        setError(error2.message);
      } finally {
        setLoading(false);
      }
    };
    const { Button, Card, Badge } = window.GameCP_SDK;
    return /* @__PURE__ */ import_react3.default.createElement("div", { className: "p-4 sm:p-6" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-6" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react3.default.createElement("h1", { className: "text-xl sm:text-2xl font-bold text-foreground" }, "Discord Notifications"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-sm sm:text-base text-muted-foreground mt-1" }, "Configure Discord webhooks to receive notifications about your game server")))), (error || message) && /* @__PURE__ */ import_react3.default.createElement("div", { className: "mb-6" }, error && /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-destructive/10 border border-destructive/20 rounded-md p-3 text-destructive text-sm font-medium" }, error), message && /* @__PURE__ */ import_react3.default.createElement("div", { className: "bg-success-light/10 border border-success-light/20 rounded-md p-3 text-success-dark text-sm font-medium" }, message)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "space-y-4 sm:space-y-6" }, /* @__PURE__ */ import_react3.default.createElement(
      Card,
      {
        title: "Webhook Configuration",
        description: "Configure Discord webhooks to receive notifications about your game server events.",
        icon: TbBrandDiscord,
        iconColor: "blue",
        padding: "lg"
      },
      /* @__PURE__ */ import_react3.default.createElement("form", { onSubmit: handleSave, className: "space-y-6 mt-4" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("label", { className: "block text-sm font-semibold text-foreground mb-1" }, "Discord Webhook URL ", /* @__PURE__ */ import_react3.default.createElement("span", { className: "text-red-500" }, "*")), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs text-muted-foreground mb-2" }, "Enter the full webhook URL from your Discord server integration settings."), /* @__PURE__ */ import_react3.default.createElement(
        "input",
        {
          type: "url",
          value: webhookUrl,
          onChange: (e) => setWebhookUrl(e.target.value),
          placeholder: "https://discord.com/api/webhooks/...",
          className: "w-full px-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-all",
          required: true
        }
      )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col sm:flex-row gap-3" }, /* @__PURE__ */ import_react3.default.createElement(
        Button,
        {
          type: "submit",
          isLoading: loading,
          variant: "primary"
        },
        "Save Webhook"
      ), /* @__PURE__ */ import_react3.default.createElement(
        Button,
        {
          type: "button",
          onClick: handleTest,
          isLoading: loading,
          disabled: webhooks.length === 0,
          variant: "secondary"
        },
        "Send Test Message"
      )))
    ), webhooks.length > 0 && /* @__PURE__ */ import_react3.default.createElement(
      Card,
      {
        title: "Active Integrations",
        padding: "none",
        headerClassName: "p-4 sm:px-6 border-b border-border"
      },
      /* @__PURE__ */ import_react3.default.createElement("div", { className: "divide-y divide-border" }, webhooks.map((webhook, index) => /* @__PURE__ */ import_react3.default.createElement("div", { key: index, className: "px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-muted/50 transition-colors" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center min-w-0 mr-4" }, /* @__PURE__ */ import_react3.default.createElement(Badge, { variant: "success", size: "sm", className: "mr-3" }, "Active"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "font-mono text-xs sm:text-sm text-muted-foreground truncate" }, webhook.url)), /* @__PURE__ */ import_react3.default.createElement(
        Button,
        {
          onClick: () => handleDelete(webhook.url),
          variant: "danger",
          size: "sm",
          isLoading: loading
        },
        "Remove"
      ))))
    )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "mt-6 sm:mt-8" }, /* @__PURE__ */ import_react3.default.createElement(
      Card,
      {
        variant: "filled",
        padding: "md",
        title: "About Discord Webhooks"
      },
      /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-start" }, /* @__PURE__ */ import_react3.default.createElement("svg", { className: "w-5 h-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react3.default.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ import_react3.default.createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }), /* @__PURE__ */ import_react3.default.createElement("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })), /* @__PURE__ */ import_react3.default.createElement("div", { className: "text-xs sm:text-sm text-muted-foreground" }, /* @__PURE__ */ import_react3.default.createElement("p", null, "Webhook URLs are unique to each Discord channel. You can create them in your Discord server settings under Integrations > Webhooks. Once configured, events like server start, stop, and crashes will be sent directly to your channel.")))
    )));
  }

  // src/handlers.js
  async function saveWebhook(ctx) {
    const { serverId, webhookUrl } = ctx.request.body;
    const trimmedUrl = webhookUrl ? webhookUrl.trim() : "";
    const isValid = trimmedUrl && (trimmedUrl.startsWith("https://discord.com/api/webhooks/") || trimmedUrl.startsWith("https://canary.discord.com/api/webhooks/") || trimmedUrl.startsWith("https://ptb.discord.com/api/webhooks/") || trimmedUrl.startsWith("https://discordapp.com/api/webhooks/"));
    if (!isValid) {
      return {
        status: 400,
        body: {
          error: "Invalid Discord webhook URL",
          details: `Received: ${trimmedUrl}`
        }
      };
    }
    await ctx.db.collection("webhooks").insertOne({
      serverId,
      url: webhookUrl,
      createdAt: /* @__PURE__ */ new Date()
    });
    return {
      status: 200,
      body: { message: "Webhook saved successfully" }
    };
  }
  async function deleteWebhook(ctx) {
    const { serverId, webhookUrl } = ctx.request.body;
    await ctx.db.collection("webhooks").deleteOne({
      serverId,
      url: webhookUrl
    });
    return {
      status: 200,
      body: { message: "Webhook removed successfully" }
    };
  }
  async function getWebhooks(ctx) {
    const { serverId } = ctx.request.query;
    let webhooks = await ctx.db.collection("webhooks").find({ serverId }).toArray();
    if (webhooks.length === 0 && ctx.config.webhookUrl) {
      webhooks = [{
        url: ctx.config.webhookUrl,
        serverId,
        isLegacy: true
      }];
    }
    return {
      status: 200,
      body: { webhooks }
    };
  }
  async function testWebhook(ctx) {
    const { serverId } = ctx.request.body;
    const webhooksRes = await getWebhooks({ ...ctx, request: { query: { serverId } } });
    const webhooks = webhooksRes.body.webhooks;
    if (webhooks.length === 0) {
      return {
        status: 404,
        body: { error: "No webhooks configured" }
      };
    }
    for (const webhook of webhooks) {
      await sendDiscordMessage(ctx, webhook.url, {
        embeds: [{
          title: "\u{1F9EA} Test Message",
          description: "Discord notifications are working correctly!",
          color: 65280,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }]
      });
    }
    return {
      status: 200,
      body: { message: "Test message sent" }
    };
  }
  async function handleCrash(event, payload, ctx) {
    const { serverId, serverName, crashReason } = payload;
    const webhooksRes = await getWebhooks({ ...ctx, config: ctx.config, request: { query: { serverId } } });
    const webhooks = webhooksRes.body.webhooks;
    for (const webhook of webhooks) {
      await sendDiscordMessage(ctx, webhook.url, {
        embeds: [{
          title: "\u{1F534} Server Crashed",
          description: `**${serverName}** has crashed`,
          fields: [
            { name: "Reason", value: crashReason || "Unknown", inline: false },
            { name: "Time", value: (/* @__PURE__ */ new Date()).toLocaleString(), inline: true }
          ],
          color: 16711680,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }]
      });
    }
    await ctx.db.collection("logs").insertOne({
      serverId,
      event: "crash",
      timestamp: /* @__PURE__ */ new Date(),
      payload
    });
  }
  async function handleStart(event, payload, ctx) {
    const { serverId, serverName } = payload;
    const webhooksRes = await getWebhooks({ ...ctx, config: ctx.config, request: { query: { serverId } } });
    const webhooks = webhooksRes.body.webhooks;
    for (const webhook of webhooks) {
      await sendDiscordMessage(ctx, webhook.url, {
        embeds: [{
          title: "\u{1F7E2} Server Started",
          description: `**${serverName}** is now online`,
          color: 65280,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }]
      });
    }
  }
  async function handleStop(event, payload, ctx) {
    const { serverId, serverName } = payload;
    const webhooksRes = await getWebhooks({ ...ctx, config: ctx.config, request: { query: { serverId } } });
    const webhooks = webhooksRes.body.webhooks;
    for (const webhook of webhooks) {
      await sendDiscordMessage(ctx, webhook.url, {
        embeds: [{
          title: "\u{1F7E1} Server Stopped",
          description: `**${serverName}** has been stopped`,
          color: 16755200,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }]
      });
    }
  }
  async function sendDiscordMessage(ctx, webhookUrl, payload) {
    const response = await ctx.http.post(webhookUrl, payload);
    if (response.status >= 400) {
      throw new Error(`Discord API error: ${response.status}`);
    }
  }
  return __toCommonJS(bridge_exports);
})()