document.getElementById("calculateButton").addEventListener("click", () => {
    const gender = document.getElementById("gender").value;
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);

    if (!weight || !height || weight <= 0 || height <= 0) {
        alert("Please enter valid weight and height!");
        return;
    }

    // Calculate BMI
    const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

    // Determine BMI status
    let status = "";
    let healthyMin, healthyMax;

    if (gender === "male") {
        healthyMin = 18.5 * ((height / 100) ** 2);
        healthyMax = 24.9 * ((height / 100) ** 2);

        if (bmi < 18.5) status = "Underweight";
        else if (bmi < 24.9) status = "Normal weight";
        else if (bmi < 29.9) status = "Overweight";
        else status = "Obese";
    } else if (gender === "female") {
        healthyMin = 18 * ((height / 100) ** 2);
        healthyMax = 23.9 * ((height / 100) ** 2);

        if (bmi < 18) status = "Underweight";
        else if (bmi < 23.9) status = "Normal weight";
        else if (bmi < 28.9) status = "Overweight";
        else status = "Obese";
    }

    // Define goals and advice based on BMI status
    const recommendations = {
        "Underweight": {
            goal: "Gain weight healthily, build muscle, and improve overall nutrition.",
            advice: [
                "Eat calorie-dense, nutritious foods: Prioritize protein (lean meat, fish, eggs, beans), healthy carbs (brown rice, sweet potatoes), and good fats (avocado, olive oil, nuts).",
                "Have multiple small meals: Eat 5-6 meals a day for easier digestion.",
                "Incorporate strength training: Light weightlifting or yoga helps build muscle instead of just gaining fat.",
                "Drink high-calorie beverages: Smoothies or milk are easy ways to boost calorie intake."
            ]
        },
        "Normal weight": {
            goal: "Maintain your current weight and stay healthy.",
            advice: [
                "Balance your meals: Include vegetables, protein, carbs, and healthy fats in your daily intake.",
                "Exercise at least 30 minutes/day: Walking, swimming, light gym workouts, or any favorite sport works well.",
                "Stay hydrated (2-3 liters/day): Supports metabolism and keeps skin healthy.",
                "Get enough sleep (7-8 hours): Helps your body recover and keeps your mind sharp."
            ]
        },
        "Overweight": {
            goal: "Lose fat, improve activity levels.",
            advice: [
                "Cut back on sugar and refined carbs: Avoid sweets, sugary drinks, and white rice.",
                "Eat more veggies and protein: Helps you feel full longer and preserve muscle.",
                "Combine cardio and resistance workouts: Jogging, swimming, cycling with light weight training burns fat effectively.",
                "Portion control: Use smaller plates and avoid distractions like watching TV while eating."
            ]
        },
        "Obese": {
            goal: "Sustainable weight loss, improve heart health and joint function.",
            advice: [
                "Reduce calorie intake: Aim for 500-700 fewer calories per day than your maintenance level.",
                "Prioritize whole grains and high-fiber foods: Keeps you full and stabilizes blood sugar.",
                "Exercise regularly: Walking, swimming (gentle on joints), and light strength exercises are effective.",
                "Monitor your health frequently: Regularly check blood pressure, blood sugar, and cholesterol."
            ]
        }
    };

    const { goal, advice } = recommendations[status];

    // Determine weight difference to a healthy range
    let message = "";
    if (status !== "Normal weight") {
        if (weight < healthyMin) {
            const gainWeight = (healthyMin - weight).toFixed(1);
            message = `You're ${gainWeight} lbs away from a healthy weight. Try gaining some weight!`;
        } else if (weight > healthyMax) {
            const loseWeight = (weight - healthyMax).toFixed(1);
            message = `You're ${loseWeight} lbs away from a healthy weight. Consider losing some weight!`;
        }
    } else {
        message = "You're at a healthy weight! Keep it up!";
    }

    // Save data to sessionStorage
    sessionStorage.setItem("goal", goal);
    advice.forEach((adv, index) => sessionStorage.setItem(`advice${index}`, adv));

    // Redirect with results and message
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');  // Giả sử user_id được truyền qua URL
    window.location.href = `/bmi/result?bmi=${bmi}&status=${status}&message=${encodeURIComponent(message)}&userId=${userId}`;

});