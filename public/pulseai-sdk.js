/**
 * PulseAI tracking snippet.
 *
 * Usage:
 *   <script src="https://<your-deployment>/pulseai-sdk.js"></script>
 *   <script>
 *     pulseai.init("YOUR_ORG_WRITE_KEY");
 *     pulseai.track("signed_up", { plan: "free" });
 *   </script>
 */
(function (window) {
  var STORAGE_KEY = "pulseai_distinct_id";
  var writeKey = null;
  var endpoint = null;

  function getEndpoint() {
    if (endpoint) return endpoint;
    var scripts = document.getElementsByTagName("script");
    var src = scripts[scripts.length - 1].src;
    var origin = src ? new URL(src).origin : window.location.origin;
    endpoint = origin + "/api/events";
    return endpoint;
  }

  function getDistinctId() {
    try {
      var existing = window.localStorage.getItem(STORAGE_KEY);
      if (existing) return existing;
      var id =
        "anon_" +
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 10);
      window.localStorage.setItem(STORAGE_KEY, id);
      return id;
    } catch (e) {
      return "anon_no_storage";
    }
  }

  function init(key) {
    writeKey = key;
  }

  function track(eventName, properties) {
    if (!writeKey) {
      console.warn("pulseai.track called before pulseai.init(writeKey)");
      return;
    }

    var payload = JSON.stringify({
      writeKey: writeKey,
      distinctId: getDistinctId(),
      eventName: eventName,
      properties: properties || {},
      occurredAt: new Date().toISOString(),
    });

    fetch(getEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(function () {
      // Ingestion is best-effort from the client; failures are swallowed so
      // tracking calls never break the host page.
    });
  }

  window.pulseai = { init: init, track: track };
})(window);
