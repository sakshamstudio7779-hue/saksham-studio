
/* =====================================================
   SAKSHAM'S STUDIO
   WEBSITE JAVASCRIPT + FIREBASE LIVE REVIEWS
===================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";


/* =====================================================
   1. FIREBASE CONFIGURATION
===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyDyl6pkqEBYGRIxZlORuzmjUhVaULGrFcI",
    authDomain: "saksham-studio-reviews.firebaseapp.com",
    projectId: "saksham-studio-reviews",
    storageBucket: "saksham-studio-reviews.firebasestorage.app",
    messagingSenderId: "854326281038",
    appId: "1:854326281038:web:c0a19225da348708d1141f"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const reviewsCollection = collection(db, "reviews");


/* =====================================================
   2. BOOKING FORM → WHATSAPP
===================================================== */

const bookingForm = document.getElementById("bookingForm");

if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const eventType =
            document.getElementById("event").value;

        const date =
            document.getElementById("date").value;

        const message =
            document.getElementById("message").value.trim();

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit WhatsApp number.");
            return;
        }

        const whatsappMessage =
            "Hello Saksham's Studio! 👋\n\n" +
            "I would like to enquire about photography.\n\n" +
            "Name: " + name + "\n" +
            "WhatsApp Number: " + phone + "\n" +
            "Event: " + eventType + "\n" +
            "Event Date: " + date + "\n" +
            "Message: " + (message || "No additional details.") +
            "\n\nThank you!";

        const whatsappURL =
            "https://wa.me/917841080180?text=" +
            encodeURIComponent(whatsappMessage);

        window.open(
            whatsappURL,
            "_blank",
            "noopener,noreferrer"
        );
    });
}


/* =====================================================
   3. MINIMUM EVENT DATE
===================================================== */

const dateInput = document.getElementById("date");

if (dateInput) {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    dateInput.min = `${year}-${month}-${day}`;
}


/* =====================================================
   4. NAVBAR SCROLL EFFECT
===================================================== */

const navbar = document.querySelector(".navbar");

if (navbar) {
    window.addEventListener("scroll", function () {
        navbar.style.background = window.scrollY > 50
            ? "rgba(247, 243, 236, 0.98)"
            : "rgba(247, 243, 236, 0.96)";
    });
}


/* =====================================================
   5. SMOOTH NAVIGATION
===================================================== */

const navigationLinks =
    document.querySelectorAll(".navbar nav a");

navigationLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        // Native href navigation handles section links.
    });
});


/* =====================================================
   6. LIGHTBOX
===================================================== */

const galleryImages =
    document.querySelectorAll(".gallery-item img");

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const lightboxClose =
    document.getElementById("lightboxClose");

if (
    galleryImages.length > 0 &&
    lightbox &&
    lightboxImage &&
    lightboxClose
) {
    galleryImages.forEach(function (image) {
        image.addEventListener("click", function () {
            lightboxImage.src = image.src;
            lightboxImage.alt = image.alt;

            lightbox.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    });

    lightboxClose.addEventListener(
        "click",
        closeLightbox
    );

    lightbox.addEventListener("click", function (event) {
        if (event.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = "";
    }
}


/* =====================================================
   7. FIREBASE LIVE REVIEWS
===================================================== */

const reviewForm =
    document.getElementById("reviewForm");

const reviewsGrid =
    document.getElementById("reviewsGrid");

const averageRating =
    document.getElementById("averageRating");

const averageStars =
    document.getElementById("averageStars");

const ratingCount =
    document.getElementById("ratingCount");

const reviewStatus =
    document.getElementById("reviewStatus");


/* ---------- REVIEW STATUS MESSAGE ---------- */

function setReviewStatus(message) {
    if (reviewStatus) {
        reviewStatus.textContent = message;
    }
}


/* ---------- CREATE SAFE HTML ELEMENTS ---------- */

function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}


/* ---------- DISPLAY REVIEWS ---------- */

function renderReviews(snapshot) {
    if (!reviewsGrid) return;

    const reviews = snapshot.docs
        .map(function (documentSnapshot) {
            return {
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            };
        })
        .filter(function (review) {
            return (
                typeof review.name === "string" &&
                typeof review.service === "string" &&
                typeof review.message === "string" &&
                Number.isInteger(review.rating) &&
                review.rating >= 1 &&
                review.rating <= 5
            );
        });

    reviewsGrid.replaceChildren();

    if (reviews.length === 0) {
        const empty = makeElement(
            "div",
            "reviews-empty"
        );

        empty.appendChild(
            makeElement(
                "p",
                "",
                "Every story deserves to be heard."
            )
        );

        empty.appendChild(
            makeElement(
                "p",
                "",
                "Be among the first to share your experience with Saksham Studio."
            )
        );

        reviewsGrid.appendChild(empty);

        if (averageRating) {
            averageRating.textContent = "—";
        }

        if (averageStars) {
            averageStars.textContent = "☆☆☆☆☆";
        }

        if (ratingCount) {
            ratingCount.textContent = "No reviews yet";
        }

        return;
    }

    /* ---------- CALCULATE AVERAGE RATING ---------- */

    const total = reviews.reduce(
        function (sum, review) {
            return sum + review.rating;
        },
        0
    );

    const average = total / reviews.length;

    if (averageRating) {
        averageRating.textContent = average.toFixed(1);
    }

    if (averageStars) {
        const roundedAverage = Math.round(average);

        averageStars.textContent =
            "★".repeat(roundedAverage) +
            "☆".repeat(5 - roundedAverage);
    }

    if (ratingCount) {
        ratingCount.textContent =
            reviews.length === 1
                ? "Based on 1 review"
                : "Based on " + reviews.length + " reviews";
    }

    /* ---------- CREATE REVIEW CARDS ---------- */

    reviews.forEach(function (review) {
        const card = makeElement(
            "article",
            "live-review-card"
        );

        const header = makeElement(
            "div",
            "live-review-card-header"
        );

        const name = makeElement(
            "h3",
            "live-review-card-name",
            review.name
        );

        const stars = makeElement(
            "div",
            "live-review-card-stars",
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating)
        );

        const service = makeElement(
            "p",
            "live-review-card-service",
            review.service
        );

        const message = makeElement(
            "p",
            "live-review-card-message",
            review.message
        );

        header.append(name, stars);

        card.append(
            header,
            service,
            message
        );

        reviewsGrid.appendChild(card);
    });
}



/* =====================================================
   8. REAL-TIME FIRESTORE LISTENER
===================================================== */

if (reviewsGrid) {
    const reviewsQuery = query(
        reviewsCollection,
        orderBy("createdAt", "desc")
    );

    onSnapshot(
        reviewsQuery,
        function (snapshot) {
            renderReviews(snapshot);

            setReviewStatus(
                "Reviews are live and shared with visitors."
            );
        },
        function (error) {
            console.error(
                "Could not load Firebase reviews:",
                error
            );

            setReviewStatus(
                "Reviews could not load. Please check your Firebase connection and Firestore rules."
            );
        }
    );
}


/* =====================================================
   9. SAVE REVIEW TO FIRESTORE
===================================================== */

if (reviewForm) {
    reviewForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            const name =
                document.getElementById("reviewName")
                    .value.trim();

            const service =
                document.getElementById("reviewService")
                    .value;

            const selectedRating =
                reviewForm.querySelector(
                    'input[name="rating"]:checked'
                );

            const message =
                document.getElementById("reviewMessage")
                    .value.trim();

            const submitButton =
                reviewForm.querySelector(
                    'button[type="submit"]'
                );

            if (
                !name ||
                !service ||
                !selectedRating ||
                !message
            ) {
                setReviewStatus(
                    "Please complete all review fields."
                );

                return;
            }

            const rating = Number(
                selectedRating.value
            );

            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {
                setReviewStatus(
                    "Please select a rating from 1 to 5 stars."
                );

                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
            }

            setReviewStatus(
                "Submitting your review..."
            );

            try {
                await addDoc(
                    reviewsCollection,
                    {
                        name: name,
                        service: service,
                        rating: rating,
                        message: message,
                        createdAt: serverTimestamp()
                    }
                );

                reviewForm.reset();

                setReviewStatus(
                    "Thank you, " +
                    name +
                    "! Your review has been shared."
                );

            } catch (error) {
                console.error(
                    "Could not submit Firebase review:",
                    error
                );

                setReviewStatus(
                    "Sorry, your review could not be submitted. Please try again later."
                );

            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                }
            }
        }
    );
}


/* =====================================================
   WEBSITE LOADED
===================================================== */

console.log(
    "Saksham's Studio website and Firebase reviews loaded."
);
