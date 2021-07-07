import deburr from 'lodash';

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


// Process the levenshtein distance between two strings
// 'input': string
// 'symptom_name': string
// Returns: int
function levenshtein(input, symptom) {
    // First get rid of the accents or strange characters
    var clean_input = deburr(input)
    var clean_symptom = deburr(symptom)

    // Create the substitution matrix
    var sub = new Array()
    for (var i = 0; i < clean_input.length; i++) {
        var temp = new Array();
        for (var j = 0; j < clean_symptom.length; j++)
            temp.push(clean_input[i] === clean_symptom[j] ? 0 : 1)
        sub.push(temp)        
    }

    // Create the levenshtein matrix
    var mat = new Array();
    for (var i = 0; i < clean_input.length + 1; i++) {
        var temp = new Array();
        for (var j = 0; j < clean_symptom.length + 1; j++) {
            if (i == 0)
                temp.push(j)
            else if (j == 0)
                temp.push(i)
            else
                temp.push(0)
        }
        mat.push(temp)
    }

    // Calculate the levenshtein matrix
    for (var i = 1; i < clean_input.length + 1; i++) {
        for (var j = 1; j < clean_symptom.length + 1; j++) {
            mat[i][j] = Math.min(Math.min(mat[i - 1][j] + 1, mat[i][j - 1] + 1), mat[i - 1][j - 1] + sub[i - 1][j - 1])
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
    for (var i = 0; i < symptoms.length; i++)
        if (symptoms[i].keywords.includes(symptom_name))
            return symptoms[i]
        for (var j = 0; j < symptoms[i].keywords.length; j++)
            if (levenshtein(symptom_name, symptoms[i].keywords[j]) < leven_max)
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
    
    var symptom = get_symptom_from_name(input, 3)
    if (symptom == null)
        return "Nous ne connaissons pas ce symptôme"
    
    picked_symptoms.push(symptom)

    var diseases = get_diseases_from_symptoms(picked_symptoms)
    if (diseases.length == 1)
        return complete_tree(diseases)
    
    var suggested_symptoms = suggest_symptoms(diseases)
    return symptoms_suggestion_to_string(suggested_symptoms)
}