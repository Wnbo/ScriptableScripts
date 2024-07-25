const athleteID = "YOUR_ATHLETE_ID";
const API_KEY = "YOUR_API_KEY";

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");
const formattedToday = `${year}-${month}-${day}`;

const pastDate = new Date();
pastDate.setDate(today.getDate() - 6);
const pastYear = pastDate.getFullYear();
const pastMonth = String(pastDate.getMonth() + 1).padStart(2, "0");
const pastDay = String(pastDate.getDate()).padStart(2, "0");
const formattedPastDate = `${pastYear}-${pastMonth}-${pastDay}`;

const getData = async () => {
  const url = `https://intervals.icu/api/v1/athlete/${athleteID}/wellness?oldest=${formattedPastDate}&newest=${formattedToday}`;
  const req = await new Request(url);
  const auth = btoa(`API_KEY:${API_KEY}`);
  req.headers = {
    Authorization: `Basic ${auth}`,
  };
  const res = await req.loadJSON();
  return res;
};

const getChart = async () => {
  const data = await getData();
  const labels = [];
  const ctls = [];
  const atls = [];
  const forms = [];

  data.forEach((item) => {
    labels.push(item.id.slice(5));
    ctls.push(item.ctl.toFixed(2));
    atls.push(item.atl.toFixed(2));
    forms.push((item.ctl - item.atl).toFixed(2));
  });

  const today = data.find(item => item.id === formattedToday) || data[data.length - 1];

  const charts = {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Fitness",
          data: ctls,
          fill: false,
          borderColor: "#34ace4",
          lineTension: 0.2,
          yAxisID: 'y1',
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: "Fatigue",
          data: atls,
          fill: false,
          borderColor: "#6633cc",
          lineTension: 0.2,
          yAxisID: 'y1',
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          label: "Form",
          data: forms,
          fill: false,
          borderColor: '#33cc4c',
          lineTension: 0.2,
          yAxisID: 'y2',
          pointRadius: 0,
          borderWidth: 2,
        },
      ],
    },
    options: {
      legend: {
        labels: {
          fontSize: 10,
        }
      },
      scales: {
        yAxes: [
          {
            id: 'y1',
            display: 'true',
            position: 'left',
            ticks: {
              suggestedMax: 8,
            }
          },
          {
            id: 'y2',
            display: 'true',
            position: 'right',
            ticks: {
              suggestedMax: 8,
            }
          },
        ]
      }
    }
  };

  const url = "https://quickchart.io/chart";

  const request = new Request(url);
  request.method = "POST";
  request.headers = { "Content-Type": "application/json" };
  request.body = JSON.stringify({
    width: 300,
    height: 130,
    chart: charts,
  });

  try {
    const imageData = await request.loadImage();

    const widget = new ListWidget();

    const stack = widget.addStack();
    stack.layoutVertically();

    const imageWidget = stack.addImage(imageData)

    imageWidget.imageSize = new Size(300, 130);
    imageWidget.centerAlignImage();

    const textStack = stack.addStack();
    textStack.layoutHorizontally();

    textStack.addSpacer();

    const text1 = textStack.addText(`${today.id} Fitness: `);
    text1.font = Font.systemFont(10);
    text1.textColor = Color.gray();

    const text2 = textStack.addText(`${today.ctl.toFixed(2)}`);
    text2.font = Font.systemFont(10);
    text2.textColor = new Color('#34ace4');

    const text3 = textStack.addText('. Fatigue: ');
    text3.font = Font.systemFont(10);
    text3.textColor = Color.gray();

    const text4 = textStack.addText(`${today.atl.toFixed(2)}`);
    text4.font = Font.systemFont(10);
    text4.textColor = new Color('#6633cc');

    const text5 = textStack.addText('. Form: ');
    text5.font = Font.systemFont(10);
    text5.textColor = Color.gray();

    const text6 = textStack.addText(`${(today.ctl- today.atl).toFixed(2)}`);
    text6.font = Font.systemFont(10);
    const val = today.ctl - today.atl;
    if (val > 20) text6.textColor  = new Color('##e4ae00');
    else if (val <= 20 && val > 5) text6.textColor  = new Color('#34ace4');
    else if (val <= 5 && val > -10) text6.textColor =  new Color('#999999');
    else if (val <= -10 && val > -30) text6.textColor = new Color('#33cc4c');
    else if (val <= -30) text6.textColor =  new Color('#dd0000');
    else text6.textColor =  Color.gray();

    textStack.addSpacer();

    Script.setWidget(widget);
    widget.presentMedium();
  } catch (error) {
    console.error(error);
  }
};

getChart();