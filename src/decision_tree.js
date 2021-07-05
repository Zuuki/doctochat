
/*
    Example:
    {
        "symptoms": [
            {
                "id": 1,
                "name": "Headache",
                "keywords": ["headache", "head"]
            }
        ]
        "diseases": [
            {
                {
                    "id": 1,
                    "name": "Migraine",
                    "symptoms": [1]
                }
            }
        ],
        "doctors": [
            {
                {
                    "id": 1,
                    "name": "Headache Specialist",
                    "diseases": [1]
                },
            }
        ]
    }
*/
const diagnostics_data = require('./diagnostics.json');

// List[Symptom]
var picked_symptoms = []


// Returns the symptom matching the name 'symptom_name'
// 'symptom_name': string
// Returns: Symptom or null
function get_symptom_from_name(symptom_name)
{
    var symptoms = diagnostics_data["symptoms"]
    for (var i = 0; i < symptoms.length; i++)
        if (symptoms[i].keywords.includes(symptom_name))
            return symptoms[i]
    
    return null
}

// Returns the symptom matching the id 'symptom_id'
// 'symptom_id': int
// Returns: Symptom or null
function get_symptom_from_id(symptom_id)
{
    var symptoms = diagnostics_data["symptoms"]
    for (var i = 0; i < symptoms.length; i++)
        if (symptoms[i].id == symptom_id)
            return symptoms[i]
    
    return null
}

// Returns all diseases containing at least 'symptoms'
// 'symptoms': List[int]
// Returns: List[Disease]
function get_diseases_from_symptoms(symptoms)
{
    var diseases = diagnostics_data["diseases"]
    var selected_diseased = []

    for (var i = 0; i < diseases.length; i++)
    {
        var contains_symptom = true
        for (var j = 0; j < symptoms.length; j++)
        {
            if (!diseases[i].symptoms.includes(symptoms[j].id))
            {
                contains_symptom = false
                break
            }
        }

        if (contains_symptom)
            selected_diseased.push(diseases[i])
    }

    return selected_diseased
}

// Returns the doctor matching 'diseases'
// If all diseases can be fixed by one doctor, return it, otherwise, return 'Médecin Généraliste'
// 'diseases': List[Disease]
// Returns: Doctor
function get_doctor_from_diseases(diseases)
{
    var doctors = diagnostics_data["doctors"]
    var selected_doctors = []

    for (var i = 0; i < doctors.length; i++)
        for (var j = 0; j < diseases.length; j++)
            if (doctors[i].diseases.includes(diseases[j].id))
                // A disease can only be associated to 1 doctor at most
                if (!selected_doctors.includes(doctors[i]))
                    selected_doctors.push(doctors[i])
    
    if (selected_doctors.length != 1)
        // "Médecin Généraliste"
        return doctors[0]
    return selected_doctors[0]
}

// Returns diagnostic and associated doctor using 'diseases'
// 'diseases': List[disease]
// Returns: string
function complete_tree(diseases)
{
    var answer = ""
    
    if (diseases.length == 1)
        answer = `Vous avez probablement le problème: ${diseases[0].name}`
    else if (diseases.length <= 5)
    {
        answer = "Il est possible que vous ayez un des problèmes suivants:"
        for (var i = 0; i < diseases.length; i++)
            answer += `\n- ${diseases[i].name}`
    }
    
    var doctor = get_doctor_from_diseases(diseases)
    answer += `\n Nous vous conseillons de consulter:\n${doctor.name}`
    return answer
}

// Returns new possible symptoms that could help improve the diagnostic
// 'diseases': List[Disease]
// Returns: List[Symptom]
function suggest_symptoms(diseases)
{
    // Remove all symptoms appearing twice, leaving only symptoms that can
    // eliminate diseases when picked
    // Ex: [1, 2, 3, 5], [1, 3, 6], [3, 6, 7] -> [2, 5, 7]

    function disease_contains_symptom(disease, x)
    {
        var found = disease.symptoms.find(elt => elt == x)
        if (found)
            return true
        return false
    }

    var not_differenciating_symptoms = []
    for (var i = 0; i < diseases.length; i++)
    {
        for (var j = i + 1; j < diseases.length; j++)
        {
            for (var k = 0; k < diseases[i].symptoms.length; k++)
            {
                var symptom_id = diseases[i].symptoms[k]
                if (disease_contains_symptom(diseases[j], symptom_id)
                    && !not_differenciating_symptoms.includes(symptom_id))
                    not_differenciating_symptoms.push(symptom_id)
            }
        }
    }

    var differenciating_symptoms = []
    for (var i = 0; i < diseases.length; i++)
        for (var j = 0; j < diseases[i].symptoms.length; j++)
            if (!not_differenciating_symptoms.includes(diseases[i].symptoms[j]))
                differenciating_symptoms.push(diseases[i].symptoms[j])
    
    return differenciating_symptoms.map(id => get_symptom_from_id(id))
}

// Return user friendly suggestions from 'symptoms'
// 'symptoms': List[Symptom]
// Returns: string
function symptoms_suggestion_to_string(symptoms)
{
    var answer = "Réponse enregistrée. Symptômes suggérés:"
    for (var i = 0; i < symptoms.length; i++)
        answer += ` \n- ${symptoms[i].name}`
    
            
    answer += "\n\nPour terminer ce diagnostic, vous pouvez répondre 'stop' à tout moment."
    return answer
}

// Start diagnostic
// 'text': string
// Returns: string
export function init_tree(text)
{
    var symptoms = diagnostics_data["symptoms"]
    var nb_symptoms = Math.min(symptoms.length, 3)

    if (nb_symptoms == 0)
        return "La base de données des diagnostics est vide"
    
    var answer = "Quels sont vos symptômes ?"
    answer += ` ${symptoms[0].name}\n`
    for (var i = 1; i < 3; i++)
        answer += `, ${symptoms[i].name}`
    answer += "..."
    
    return answer
}

// Return next answer for the decision tree
// 'input': string
// Returns: string
export function tree_answer(input)
{
    if (input.toUpperCase() == "STOP")
    {
        var diseases = get_diseases_from_symptoms(picked_symptoms)
        return complete_tree(diseases)
    }
    
    var symptom = get_symptom_from_name(input)
    if (symptom == null)
        return "Nous ne connaissons pas ce symptôme"
    
    picked_symptoms.push(symptom)

    var diseases = get_diseases_from_symptoms(picked_symptoms)
    if (diseases.length == 1)
        return complete_tree(diseases)
    
    var suggested_symptoms = suggest_symptoms(diseases)
    return symptoms_suggestion_to_string(suggested_symptoms)
}