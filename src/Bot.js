import { tree_answer, init_tree } from './decision_tree.js';

function GenerateIcs(desc, time) {
  //const ics = require('./dist');
  let ics = require("ics")
  let events = [];
  for (let i = 0; i < desc.length; i++) {
  	let event = {
  	start: [time[i].substring(0, 4), time[i].substring(4, 6), time[i].substring(6, 8), time[i].substring(8, 10), time[i].substring(10, 12)],
  	duration: { minutes: 30 },
  	title: desc[i]
  	};
  	events.push(event);
  }

  const { error, value } = ics.createEvents(events);
  var element = document.createElement('a');
  element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(value));
  element.setAttribute('download', 'doctolibrdv.ics');
  document.body.appendChild(element);
  element.click();
  console.log('tests');
}

var context = {
    "mode": "default",
    "doctor_name": null
}

export default context;

export function bot_answer(text)
{
    if (context.mode === "default")
    {
        // Try to change context.mode
        if (text === "diag" || text === "diagnostic" || text === "2")
        {
            context.mode = "diagnostic"
            return init_tree()
        }
        if (text === "test")
        {
            return ["works"];
        }
        if (text === "1")
        {
        	GenerateIcs(["rdv docto 1", "rdv docto 2"], ["202201151430", "202201160915"]);
        	return ["Voici votre fichier ics contenant vos rendez-vous"];
        }
        return ["not test"];
    } else if (context.mode === "end") {
        if (text === "diagnostic") {
            context.mode = "diagnostic"
            return init_tree()
        } 
    } else if (context.mode === "diagnostic")
    {
        return tree_answer(text)
    } else if (context.mode === "done")
    {
        if (text === "oui" || text === "Oui") {
            context.mode = "link";
            return ["Veuillez entrer la ville où vous souhaitez chercher un rendez-vous"]
        } else if (text === "non" || text === "Non") {
            context.mode = "end"
            return ["Merci d'avoir utilisé le chatbot Doctolib !", "Si vous voulez effectuer un autre diagnostic, écrivez diagnostic"]
        } else {
            return ["Nous n'avons pas compris votre choix"]
        }
    } else if (context.mode === "link") {
        var city = text.replace(/\s/g, '-')
        var doctor = context.doctor_name.replace(/\s/g, '-')
        doctor = doctor.toLowerCase()
        doctor = doctor.replace(/[éè]/g, 'e')
        context.mode = "end"
        return ["Cliquez sur le lien ci-dessous pour accéder à votre recherche", "", `https://www.doctolib.fr/${doctor}/${city}`, "Merci d'avoir utilisé le chatbot Doctolib !", "Si vous voulez effectuer un autre diagnostique, écrivez diagnostique"]
    }
    else
    {
        return ["Nous n'avons pas compris votre demande, veuillez réeassayer"]
    }
}
