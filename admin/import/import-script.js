jQuery(document).ready(function ($) {
    $('#oopos-import-form').on('submit', function (e) {
        e.preventDefault();

        const formData = $(this).serialize();

        $.post(ajaxurl, formData, function (response) {
            if (response.success) {
                $('#import-result').html(
                    `<div style="color:green;font-weight:600;">${response.data.message}</div>`
                );
            } else {
                $('#import-result').html(
                    `<div style="color:red;font-weight:600;">${response.data.message || 'Error saving settings.'}</div>`
                );
            }
        }).fail(function (xhr) {
            console.error('AJAX Error:', xhr);
            $('#import-result').html(
                `<div style="color:red;font-weight:600;">AJAX request failed. Check console.</div>`
            );
        });
    });
});
