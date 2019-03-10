const ko = window.ko;
const DEFAULT_COLOR_INTENSITY = '500';
const FONT_SIZE = 8;
const FONT_HOR_SIZE = FONT_SIZE / 2;

/**
 * Make string hash
 *
 * @param str
 * @returns {number}
 */
const strHash = (str) => {
  const s = `${str}`;
  let hash = 0;
  if (s.length === 0) {return hash;}
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

const str2color = (str, intensity = DEFAULT_COLOR_INTENSITY, colors, colorsArr) => {
  const pos = Math.abs(strHash(str)) % colorsArr.length;
  const colorName = colorsArr[pos];
  const color = (colors[colorName] || { [DEFAULT_COLOR_INTENSITY]: '#999999' });
  return color[intensity] || color[DEFAULT_COLOR_INTENSITY];
};

const getProps = (p) => Object.keys(p || {}).filter(k => [
  'id',
  'created_ts_nanos',
  'created_ts_seconds',
  'updated_ts_nanos',
  'updated_ts_seconds',
  'deleted_ts_nanos',
  'deleted_ts_seconds',
].indexOf(k) === -1).sort();

const initGraph = (g, graphDomId, miniMapDomId, onNodeInfo) => {
  document.getElementById(graphDomId).innerHTML = '';
  let simulation = null;
  let subject = null;

  const onMouseEnter = (ev) => {
    const item = ev.item;
    graph.toFront(item);
  };
  const onMouseLeave = ev => {
  };

  const onMouseDown = (ev) => {
  };
  G6.registerNode('rect', {
    getPath: function getPath(item) {
      const width = (Math.max(`${item.model.type || ''}`.length, `${item.model.id || ''}`.length) + 2) * FONT_HOR_SIZE;
      const height = (2 + 0.5) * FONT_SIZE;
      return G6.Util.getRectPath(-width / 2, -height / 2, width, height, 2);
    },
  });
  const panesRect = document.getElementById('mountNode').getClientRects();
  const height = panesRect[0].height;
  const width = panesRect[0].width;
  const graph = new G6.Graph({
    modes: {
      default: ['panCanvas', 'wheelZoom'],
    },
    container: graphDomId,
    fitView: 'cc',
    animate: true,
    height,
    width,
    plugins: [
      new G6.Plugins['layout.dagre']({
        rasesep: 300,
        edgesep: 100,
        ranksep: 100,
        rankdir: 'TB',
      }),
    ],
    defaultIntersectBox: 'rect',
  });
  graph.node({
    shape: 'rect',
    style: (model) => ({
      fillOpacity: 0.45,
      lineWidth: 2,
      stroke: str2color(model.label, 500, window.COLORS, window.COLORS_ARR),
      fill: str2color(model.label, 50, window.COLORS, window.COLORS_ARR),
    }),
    label: (model) => {
      const p = getProps(model.props);
      return {
        text: `${model.type}\n${model.id}`,
        stroke: null,
        fill: '#555555',
        textAlign: 'center',
        fontSize: FONT_SIZE + 1,
        font: 'arial sans-serif',
      };
    },
  });
  graph.edge({
    style: {
      endArrow: true,

      strokeOpacity: 1,
    },
    label(model) {
      return {
        fontSize: FONT_SIZE + 2,
        font: 'arial sans-serif',
        text: `${model.types.map(t => t.toUpperCase()).join('\n')}`,
      };
    },
  });
  graph.on('node:mouseenter', ev => {
    onNodeInfo({
      props: ev.item.model.props,
      id: ev.item.model.id,
      type: ev.item.model.type,
    });

  });
  graph.read(g);
  return graph;
};

const DEFAULT_QUERY = 'MATCH (v1)-[e]->(v2) RETURN v1, e, v2';

const addNode = (item, nodeById) => {
  const id = `${item.id.id}:${item.id.oid}`;
  const type = item.label;
  const props = item.props;
  if (typeof nodeById[id] === 'undefined') {
    nodeById[id] = {
      id,
      label: type,
      type,
      props,
      x: 0,
      y: 0,
    };
  }
  return nodeById[id];
};

const addEdge = (item, edgeById) => {
  const id = `${item.id.id}:${item.id.oid}`;
  const type = item.label;
  const props = item.props;
  const start = `${item.start.id}:${item.start.oid}`;
  const end = `${item.end.id}:${item.end.oid}`;
  const edgeId = `${start}:${end}`;
  if (typeof edgeById[edgeId] === 'undefined') {
    const e = {
      id: edgeId,
      eIds: [id],
      types: [type],
      props,
      source: start,
      target: end,
    };
    edgeById[edgeId] = e;
    return e;
  } else {
    if (edgeById[edgeId].eIds.indexOf(id) === -1) {
      edgeById[edgeId].eIds.push(id);
    }
    if (edgeById[edgeId].types.indexOf(type) === -1) {
      edgeById[edgeId].types.push(type);
    }
  }
};
const AgensViewerModel = function () {
  const that = this;
  this.pending = ko.observable(false);
  this.isSuccessful = ko.observable(null);
  this.executedQuery = ko.observable('');
  this.historyRecords = ko.observableArray(window.getItem('av-history-records', []));
  this.rows = ko.observableArray([]);
  this.queryErrors = ko.observableArray([]);
  this.systemErrors = ko.observableArray([]);
  this.query = ko.observable(((this.historyRecords() || []).length > 0) ? this.historyRecords()[0].query : DEFAULT_QUERY);
  this.clearConfirm = ko.observable(false);
  this.nodeInfoType = ko.observable();
  this.nodeInfoId = ko.observable();
  this.nodeInfoProps = ko.observable();
  this.showClearConfirm = function () {
    this.clearConfirm(true);
  };
  this.hideClearConfirm = function () {
    this.clearConfirm(false);
  };
  this.clearHistory = function () {
    that.clearConfirm(false);
    const remaining = that.historyRecords().filter(r => r.marked);
    that.historyRecords(remaining);
    that.query(remaining.length > 0 ? remaining[0].query : that.query());
    window.setItem('av-history-records', that.historyRecords());
  };

  this.updateGraph = function (data) {
    this.graph = initGraph(
      data || { nodes: [], edges: [] },
      'mountNode',
      'minimap',
      (node) => {
        this.nodeInfoType(node.type);
        this.nodeInfoId(node.id);
        this.nodeInfoProps(JSON.stringify(node.props, null, 2));
      },
    );
  };

  this.updateHistory = function () {
    if ((that.historyRecords() || []).filter(
      ({ query }) => (query === that.executedQuery()),
    ).length === 0) {
      const queryRecord = {
        marked: false,
        ts: (new Date()).getTime(),
        query: that.executedQuery(),
        isSuccessful: that.isSuccessful(),
        systemErrors: that.systemErrors(),
        queryErrors: that.queryErrors(),
      };
      that.historyRecords([queryRecord].concat(that.historyRecords()));
      window.setItem('av-history-records', that.historyRecords());
    }
  };

  this.toggleHistoryRecordMark = async function (h) {
    const hr = that.historyRecords().map((r) => {
      if (r.query === h.query) {
        return Object.assign({}, r, { marked: !r.marked });
      }
      return Object.assign({}, r);
    });
    that.historyRecords(hr);
    window.setItem('av-history-records', that.historyRecords());
  };

  this.loadHistoryRecord = async function (h) {
    const selected = that.historyRecords().filter((r) => (r.query === h.query));
    const notSelected = that.historyRecords().filter((r) => (r.query !== h.query));
    that.historyRecords(selected.concat(notSelected));
    that.query(selected[0].query);
    window.setItem('av-history-records', that.historyRecords());
  };

  this.sendQuery = async function () {
    this.pending(true);
    this.executedQuery(this.query());
    localStorage.setItem('ag-query', this.executedQuery());
    const query = this.query().replace(/[\n\r\t]/g, ' ');
    let data;
    try {
      const response = await fetch(`/graph?query=${query}`);
      data = await response.json();
    } catch (error) {
      console.error(error);
      this.isSuccessful(false);
      this.queryErrors([]);
      this.rows([]);
      this.systemErrors([{ message: error.message, stack: error.stack }]);
      return;
    }
    this.isSuccessful(((!Array.isArray(data.errors)) || (data.errors.length === 0)));
    const q = this.executedQuery();
    this.queryErrors((data.errors || []).map(qe => ({
      message: qe.message,
      position: qe.position,
      head: q.substring(0, parseInt(qe.position || (q.length + 1)) - 1),
      tail: q.substring(parseInt(qe.position || (q.length + 1)) - 1, q.length),
    })));
    this.rows(data.rows || []);
    this.systemErrors(null);

    const edgeById = {};
    const nodeById = {};

    (data.rows || []).forEach(
      r => Object.keys(r).forEach(
        variable => {
          const item = r[variable];
          if (typeof item === 'object') {
            if (item.vertices && item.edges) {
              item.vertices.forEach(v => addNode(v, nodeById));
              item.edges.forEach(e => addEdge(e, edgeById));
            } else if (item.start && item.end) {
              // Edge
              addEdge(item, edgeById);
            } else if (item.label && item.id) {
              // Node
              addNode(item, nodeById);
            }
          }
        },
      ),
    );
    this.updateGraph({
      nodes: Object.values(nodeById),
      edges: Object.values(edgeById),
    });
    this.updateHistory();
  };

  return this;
};


const init = () => {
  ko.applyBindings(new AgensViewerModel(), document.getElementById('#app'));
  return null;
};

document.onload = init();

