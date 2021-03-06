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
import context from './Bot.js'

const diagnostics_data = require('./diagnostics.json');

// List[Symptom]
var picked_symptoms = []


// Process the levenshtein distance between two strings
// 'input': string
// 'symptom_name': string
// Returns: int
function levenshtein(input, symptom) {
    // First put everything in caps
    var clean_input = input.toUpperCase()
    var clean_symptom = symptom.toUpperCase()

    var temp = null

    // Create the substitution matrix
    var sub = []
    for (var i = 0; i < clean_input.length; i++) {
        temp = [];
        for (var j = 0; j < clean_symptom.length; j++)
            temp.push(clean_input[i] === clean_symptom[j] ? 0 : 1)
        sub.push(temp)        
    }

    // Create the levenshtein matrix
    var mat = []
    for (var k = 0; k < clean_input.length + 1; k++) {
        temp = [];
        for (var l = 0; l < clean_symptom.length + 1; l++) {
            if (k === 0)
                temp.push(l)
            else if (l === 0)
                temp.push(k)
            else
                temp.push(0)
        }
        mat.push(temp)
    }

    // Calculate the levenshtein matrix
    for (var x = 1; x < clean_input.length + 1; x++) {
        for (var y = 1; y < clean_symptom.length + 1; y++) {
            mat[x][y] = Math.min(Math.min(mat[x - 1][y] + 1, mat[x][y - 1] + 1), mat[x - 1][y - 1] + sub[x - 1][y - 1])
        }
    }
    // Return the levenshtein distance
    return mat[clean_input.length][clean_symptom.length];
}

// Returns the symptom matching the name 'symptom_name' having a maximum of 'leven_max' levenshtein distance 
// 'symptom_name': string
// 'leven_max': int
// Returns: Symptom or null
function get_symptom_from_name(symptom_name, leven_max)
{
    var symptoms = diagnostics_data["symptoms"]
    var closest_symptoms = []
    for (var i = 0; i < symptoms.length; i++) {
        if (symptoms[i].keywords.includes(symptom_name))
            return symptoms[i]
        for (var j = 0; j < symptoms[i].keywords.length; j++) {
            var temp = levenshtein(symptom_name, symptoms[i].keywords[j]);
            if (temp < leven_max)
                closest_symptoms.push({
                    distance: temp,
                    symptom: symptoms[i]
                });
        }
    }


    var min = Infinity;
    var indexRes = 0;
    for (var k = 0; k < closest_symptoms.length; k++) {
        if (min > closest_symptoms[k].distance) {
            min = closest_symptoms[k].distance
            indexRes = k
        }
    }
    
    if (min === Infinity)
        return null
    return closest_symptoms[indexRes].symptom
}

// Returns the symptom matching the id 'symptom_id'
// 'symptom_id': int
// Returns: Symptom or null
function get_symptom_from_id(symptom_id)
{
    var symptoms = diagnostics_data["symptoms"]
    for (var i = 0; i < symptoms.length; i++)
        if (symptoms[i].id === symptom_id)
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
// If all diseases can be fixed by one doctor, return it, otherwise, return 'M??decin G??n??raliste'
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
    
    if (selected_doctors.length !== 1)
        // "M??decin G??n??raliste"
        return doctors[0]
    return selected_doctors[0]
}

// Returns diagnostic and associated doctor using 'diseases'
// 'diseases': List[disease]
// Returns: string
function complete_tree(diseases)
{
    var answer = []
    
    if (diseases.length === 1) {
        answer.push(`Vous avez probablement le probl??me: ${diseases[0].name}`)
    }
    else if (diseases.length <= 5) {
        answer.push("Il est possible que vous ayez un des probl??mes suivants:")
        answer.push("")
        for (var i = 0; i < diseases.length; i++) {
            answer.push(`- ${diseases[i].name}`)
        }
    }
    answer.push("")

    var doctor = get_doctor_from_diseases(diseases)
    answer.push(`Nous vous conseillons de consulter:`)
    answer.push("")
    answer.push(`${doctor.name}`)
    context.mode = "done"
    context.doctor_name = doctor.name
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
        var found = disease.symptoms.find(elt => elt === x)
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
    for (var x = 0; x < diseases.length; x++)
        for (var y = 0; y < diseases[x].symptoms.length; y++)
            if (!not_differenciating_symptoms.includes(diseases[x].symptoms[y]))
                differenciating_symptoms.push(diseases[x].symptoms[y])
    
    return differenciating_symptoms.map(id => get_symptom_from_id(id))
}

// Return user friendly suggestions from 'symptoms'
// 'symptoms': List[Symptom]
// Returns: string
function symptoms_suggestion_to_string(symptoms)
{
    var answer = ["R??ponse enregistr??e. Sympt??mes sugg??r??s:"]
    answer.push("")
    for (var i = 0; i < symptoms.length; i++)
        answer.push(`- ${symptoms[i].name}`)
    
    answer.push("")        
    answer.push("Pour terminer ce diagnostic, vous pouvez r??pondre 'stop' ?? tout moment.")
    return answer
}

// Start diagnostic
// 'text': string
// Returns: string
export function init_tree(text)
{
    picked_symptoms = []
    var symptoms = diagnostics_data["symptoms"]
    var nb_symptoms = Math.min(symptoms.length, 3)

    if (nb_symptoms === 0)
        return "La base de donn??es des diagnostics est vide"
    
    var answer = ["Quels sont vos sympt??mes ?"]
    answer.push("")
    answer.push(`- ${symptoms[0].name}`)
    for (var i = 1; i < 3; i++) {
        if (i === 2)
            answer.push(`- ${symptoms[i].name} ...`)
        else
            answer.push(`- ${symptoms[i].name}`)
    }
    return answer
}

// Return next answer for the decision tree
// 'input': string
// Returns: string
export function tree_answer(input)
{
    var diseases = null
    if (input.toUpperCase() === "STOP")
    {
        diseases = get_diseases_from_symptoms(picked_symptoms)
        return complete_tree(diseases)
    }
    
    var symptom = get_symptom_from_name(input, 3)
    if (symptom == null)
        return ["Nous ne connaissons pas ce sympt??me"]
    
    picked_symptoms.push(symptom)

    diseases = get_diseases_from_symptoms(picked_symptoms)
    if (diseases.length === 1)
        return complete_tree(diseases)
    
    var suggested_symptoms = suggest_symptoms(diseases)
    return symptoms_suggestion_to_string(suggested_symptoms)
}