require "test_helper"

class CryptoControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get crypto_index_url
    assert_response :success
  end
end
