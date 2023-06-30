$(document).ready(function() {
    // Fetch FAQs from the SharePoint List
    fetchFAQs();

    function fetchFAQs() {
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('FAQs')/items?$select=Question,Answer",
            method: "GET",
            headers: { "Accept": "application/json; odata=verbose" },
            success: function(data) {
                populateFAQSection(data.d.results);
            },
            error: function(error) {
                console.error("Error fetching FAQs: ", error);
            }
        });
    }

    function populateFAQSection(faqs) {
        let faqListHTML = '';
        faqs.forEach((faq, index) => {
            faqListHTML += `
                <li data-aos="fade-up">
                    <i class="bx bx-help-circle icon-help"></i>
                    <a data-bs-toggle="collapse" class="collapse" data-bs-target="#faq-list-${index}">
                        ${faq.Question}
                        <i class="bx bx-chevron-down icon-show"></i>
                        <i class="bx bx-chevron-up icon-close"></i>
                    </a>
                    <div id="faq-list-${index}" class="collapse show" data-bs-parent=".faq-list">
                        <p> ${faq.Answer} </p>
                    </div>
                </li>
            `;
        });
        $('.faq-list ul').html(faqListHTML);
    }
});
