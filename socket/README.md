Ensure your user is member of the `dialout` group on Linux (use the `id` command) and add user to group if not already done

    $sudo usermod -a -G dialout yourUserName

* docker build .
