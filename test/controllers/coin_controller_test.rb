require "test_helper"

class CoinControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get coin_index_url
    assert_response :success
  end
end
